function apiKey() {
  const value = process.env.KIE_API_KEY?.trim();
  if (!value) throw new Error("KIE_API_KEY fehlt auf dem Server. Kein Render wurde gestartet.");
  return value;
}
function baseUrl() { return (process.env.KIE_API_BASE_URL ?? "https://api.kie.ai").replace(/\/$/, ""); }
async function request(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
      signal: controller.signal
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { throw new Error(`KIE antwortete nicht mit JSON (HTTP ${response.status}).`); }
    if (!response.ok || body.code !== 200 || body.data === undefined || body.data === null) {
      throw new Error(body.msg || `KIE-Anfrage fehlgeschlagen (HTTP ${response.status}).`);
    }
    return body.data;
  } finally { clearTimeout(timeout); }
}

export async function getCredits() {
  const data = await request("/api/v1/chat/credit", { method: "GET" });
  if (typeof data === "number") return data;
  if (typeof data === "object" && data) {
    for (const key of ["balance", "credits", "credit", "remainingCredits", "remaining_credits"]) {
      if (typeof data[key] === "number") return data[key];
    }
  }
  return data;
}
export async function createTask(body) {
  const data = await request("/api/v1/jobs/createTask", { method: "POST", body: JSON.stringify(body) });
  if (!data.taskId) throw new Error("KIE hat keine taskId zurückgegeben.");
  return data.taskId;
}
function parseResultUrls(resultJson) {
  if (!resultJson) return [];
  let parsed = resultJson;
  if (typeof resultJson === "string") { try { parsed = JSON.parse(resultJson); } catch { return []; } }
  if (!parsed || typeof parsed !== "object") return [];
  const urls = parsed.resultUrls ?? parsed.result_urls ?? parsed.urls;
  return Array.isArray(urls) ? urls.filter((u) => typeof u === "string") : [];
}
export async function getTask(taskId) {
  const data = await request(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, { method: "GET" });
  const allowed = new Set(["waiting", "queuing", "generating", "success", "fail"]);
  return {
    task_id: data.taskId ?? taskId,
    ...(data.model ? { model: data.model } : {}),
    state: allowed.has(data.state ?? "") ? data.state : "unknown",
    ...(typeof data.progress === "number" ? { progress: data.progress } : {}),
    ...(typeof data.creditsConsumed === "number" ? { credits_consumed: data.creditsConsumed } : {}),
    result_urls: parseResultUrls(data.resultJson),
    ...(data.failCode ? { error_code: data.failCode } : {}),
    ...(data.failMsg ? { error_message: data.failMsg } : {})
  };
}
export async function checkKlingMarketplace() {
  const response = await fetch("https://kie.ai/kling-3-0", { headers: { "User-Agent": "Lyra-KIE-V2/2.1" } });
  const text = await response.text();
  return { available: response.ok && /Kling\s*3\.0/i.test(text), http_status: response.status };
}

function uploadBaseUrl() {
  return (process.env.KIE_UPLOAD_BASE_URL ?? "https://kieai.redpandaai.co").replace(/\/$/, "");
}

function safeFileName(url, index) {
  try {
    const parsed = new URL(url);
    const tail = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
    const cleaned = tail.replace(/[^A-Za-z0-9._-]/g, "_").slice(-90);
    if (cleaned && /\.[A-Za-z0-9]{2,5}$/.test(cleaned)) return `lyra-${Date.now()}-${index}-${cleaned}`;
  } catch {}
  return `lyra-${Date.now()}-${index}.png`;
}

export async function uploadRemoteFile(fileUrl, { uploadPath = "lyra/kling", fileName } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${uploadBaseUrl()}/api/file-url-upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fileUrl, uploadPath, ...(fileName ? { fileName } : {}) }),
      signal: controller.signal
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { throw new Error(`KIE File Upload antwortete nicht mit JSON (HTTP ${response.status}).`); }
    if (!response.ok || body.code !== 200 || !body.data) {
      throw new Error(body.msg || `KIE File Upload fehlgeschlagen (HTTP ${response.status}).`);
    }
    const uploadedUrl = body.data.downloadUrl ?? body.data.fileUrl;
    if (!uploadedUrl || typeof uploadedUrl !== "string") throw new Error("KIE File Upload lieferte keine nutzbare URL.");
    return uploadedUrl;
  } finally {
    clearTimeout(timeout);
  }
}

export async function rehostKlingPayload(body, uploader = uploadRemoteFile) {
  if (body?.model !== "kling-3.0/video") return body;
  const cloned = structuredClone(body);
  const cache = new Map();
  let index = 0;
  const rehost = async (url) => {
    if (!url) return url;
    if (cache.has(url)) return cache.get(url);
    index += 1;
    const next = await uploader(url, { uploadPath: "lyra/kling", fileName: safeFileName(url, index) });
    cache.set(url, next);
    return next;
  };

  if (Array.isArray(cloned.input?.image_urls)) {
    cloned.input.image_urls = await Promise.all(cloned.input.image_urls.map(rehost));
  }
  if (Array.isArray(cloned.input?.kling_elements)) {
    for (const element of cloned.input.kling_elements) {
      if (Array.isArray(element.element_input_urls)) {
        element.element_input_urls = await Promise.all(element.element_input_urls.map(rehost));
      }
    }
  }
  return cloned;
}

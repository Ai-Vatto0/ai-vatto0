function apiKey() {
  const value = process.env.KIE_API_KEY?.trim();
  if (!value) throw new Error("KIE_API_KEY fehlt auf dem Server.");
  return value;
}

function baseUrl() {
  return (process.env.KIE_API_BASE_URL ?? "https://api.kie.ai").replace(/\/$/, "");
}

function uploadBaseUrl() {
  return (process.env.KIE_UPLOAD_BASE_URL ?? "https://kieai.redpandaai.co").replace(/\/$/, "");
}

async function request(path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); }
    catch { throw new Error(`KIE antwortete nicht mit JSON (HTTP ${response.status}).`); }
    if (!response.ok || body.code !== 200 || body.data === undefined || body.data === null) {
      throw new Error(body.msg || `KIE-Anfrage fehlgeschlagen (HTTP ${response.status}).`);
    }
    return body.data;
  } finally { clearTimeout(timeout); }
}

export async function getCredits() {
  return request("/api/v1/chat/credit", { method: "GET" });
}

export async function createTask(body) {
  const data = await request("/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!data.taskId) throw new Error("KIE hat keine taskId zurückgegeben.");
  return data.taskId;
}

export async function uploadRemoteFile(fileUrl, fileName) {
  const response = await fetch(`${uploadBaseUrl()}/api/file-url-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileUrl,
      uploadPath: "lyra-v2",
      ...(fileName ? { fileName } : {}),
    }),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); }
  catch { throw new Error(`KIE Upload antwortete nicht mit JSON (HTTP ${response.status}).`); }
  const url = body.data?.downloadUrl ?? body.data?.fileUrl;
  if (!response.ok || body.code !== 200 || !url) {
    throw new Error(body.msg || `KIE-Dateiupload fehlgeschlagen (HTTP ${response.status}).`);
  }
  return url;
}

function parseResultUrls(resultJson) {
  if (!resultJson) return [];
  let parsed = resultJson;
  if (typeof resultJson === "string") {
    try { parsed = JSON.parse(resultJson); } catch { return []; }
  }
  if (!parsed || typeof parsed !== "object") return [];
  const urls = parsed.resultUrls ?? parsed.result_urls ?? parsed.urls;
  return Array.isArray(urls) ? urls.filter((v) => typeof v === "string") : [];
}

export async function getTask(taskId) {
  const data = await request(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
  const states = new Set(["waiting", "queuing", "generating", "success", "fail"]);
  const state = states.has(data.state ?? "") ? data.state : "unknown";
  return {
    task_id: data.taskId ?? taskId,
    ...(data.model ? { model: data.model } : {}),
    state,
    ...(typeof data.progress === "number" ? { progress: data.progress } : {}),
    ...(typeof data.creditsConsumed === "number" ? { credits_consumed: data.creditsConsumed } : {}),
    result_urls: parseResultUrls(data.resultJson),
    ...(data.failCode ? { error_code: data.failCode } : {}),
    ...(data.failMsg ? { error_message: data.failMsg } : {}),
  };
}

export async function checkKlingMarketplace() {
  const response = await fetch("https://kie.ai/kling-3-0", {
    method: "GET",
    headers: { "User-Agent": "Lyra-KIE-V2/2.0" },
  });
  const text = await response.text();
  return { available: response.ok && /Kling\s*3\.0/i.test(text), http_status: response.status };
}

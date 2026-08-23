const axios = require('axios');

const KIE_BASE_URL = 'https://api.kie.ai/api/v1';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Coin-Kosten Tabelle (interne App-Coins, nicht Kie-Credits)
const COIN_COSTS = {
  grok_6s_480p: 10,
  grok_6s_720p: 20,
  grok_10s_480p: 20,
  grok_10s_720p: 30,
  grok_15s_480p: 30,
  grok_15s_720p: 40,
  veo31_fast: 60,
  // Kling ist absichtlich ueber ENV konfigurierbar. Das sind App-Coins,
  // nicht die von KIE im Callback gemeldeten creditsConsumed.
  kling3_pro_base: Number(process.env.KLING3_INTERNAL_COIN_COST || 20),
  wan27_image: 8,       // WAN 2.7 Primary (~$0.04 → 8 Coins)
  nano_banana_2k: 18,   // Fallback
  nano_banana_4k: 24,
  scene_generation: 5,
};

function getCoinCost(model, duration, resolution, mode) {
  if (model === 'grok') {
    const key = `grok_${duration}s_${resolution}`;
    return COIN_COSTS[key] || 20;
  }
  if (model === 'veo31') {
    return COIN_COSTS.veo31_fast;
  }
  if (model === 'kling3') {
    const base = COIN_COSTS.kling3_pro_base;
    const seconds = Math.max(3, Math.min(parseInt(duration, 10) || 4, 15));
    const modeMultiplier = mode === '4K' ? 2 : mode === 'std' ? 0.75 : 1;
    return Math.max(1, Math.ceil(base * (seconds / 4) * modeMultiplier));
  }
  return 20;
}

// KIE.AI CREDIT MONITORING — vor jeder Generation pruefen
async function checkKieCredits(minRequired = 50) {
  try {
    const response = await axios.get(`${KIE_BASE_URL}/chat/credit`, {
      headers: getHeaders(),
    });
    const credits = response.data?.data;
    if (typeof credits !== 'number') return true; // Im Zweifel erlauben
    if (credits < minRequired) {
      console.warn(`⚠️ Kie.ai Credits niedrig: ${credits} (Minimum: ${minRequired})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Credit-Check fehlgeschlagen:', err.message);
    return true; // Im Zweifel nicht blockieren
  }
}

// VIDEO GENERIERUNG: Grok (Multi-Referenz — Kie aktuell 1 Bild, Architektur fuer 7 vorbereitet)
async function generateVideoGrok(prompt, referenceImageUrls, duration, resolution) {
  const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls : (referenceImageUrls ? [referenceImageUrls] : []);
  const payload = {
    model: 'grok-video',
    prompt,
    duration: String(duration),
    resolution,
  };
  // Kie.ai aktuell: 1 Referenzbild via image_url
  // Wenn Kie Multi-Ref integriert (bis 7), wird reference_images aktiv
  if (refs.length > 0) {
    payload.image_url = refs[0];
    if (refs.length > 1) {
      payload.reference_images = refs.slice(0, 7);
    }
  }

  const response = await axios.post(`${KIE_BASE_URL}/video/generate`, payload, { headers: getHeaders() });
  return response.data;
}

// VIDEO GENERIERUNG: Veo 3.1 Fast (bis zu 3 Referenzbilder)
async function generateVideoVeo31Fast(prompt, referenceImageUrls, durationSeconds) {
  const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls : [];
  const payload = {
    model: 'veo-3.1-fast',
    prompt,
    length_seconds: durationSeconds || 8,
  };
  if (refs.length > 0) {
    payload.reference_images = refs.slice(0, 3);
  }

  const response = await axios.post(`${KIE_BASE_URL}/video/generate`, payload, { headers: getHeaders() });
  return response.data;
}

function normalizeKlingElement(element) {
  if (!element || typeof element !== 'object') return null;
  const urls = Array.isArray(element.element_input_urls) ? element.element_input_urls.filter(Boolean) : [];
  if (!element.name || !element.description || urls.length < 2 || urls.length > 4) {
    throw new Error('Kling-Element benoetigt name, description und 2-4 element_input_urls');
  }

  const normalized = {
    name: element.name,
    description: element.description,
    element_input_urls: urls,
  };

  if (Array.isArray(element.element_input_audio_urls) && element.element_input_audio_urls.length) {
    normalized.element_input_audio_urls = element.element_input_audio_urls.slice(0, 1);
  }
  if (Number.isInteger(element.start_time)) normalized.start_time = element.start_time;
  if (Number.isInteger(element.end_time)) normalized.end_time = element.end_time;
  return normalized;
}

// VIDEO GENERIERUNG: Kling 3.0 Market API
// Volt Crew Max Standard: pro, 9:16, 3-4 s, Sound an, Startframe + Produkt-Element.
async function generateVideoKling3({
  prompt,
  startFrame,
  lastFrame,
  duration = 4,
  aspectRatio = '9:16',
  mode = 'pro',
  sound = true,
  multiShots = false,
  multiPrompt = [],
  klingElements = [],
  callBackUrl,
}) {
  const dur = parseInt(duration, 10);
  if (!Number.isInteger(dur) || dur < 3 || dur > 15) {
    throw new Error('Kling 3.0 duration muss zwischen 3 und 15 Sekunden liegen');
  }
  if (!['9:16', '16:9', '1:1'].includes(aspectRatio)) {
    throw new Error('Kling 3.0 aspectRatio muss 9:16, 16:9 oder 1:1 sein');
  }
  if (!['std', 'pro', '4K'].includes(mode)) {
    throw new Error('Kling 3.0 mode muss std, pro oder 4K sein');
  }

  const elements = Array.isArray(klingElements)
    ? klingElements.map(normalizeKlingElement).filter(Boolean)
    : [];
  if (elements.length > 3) throw new Error('Kling 3.0 unterstuetzt maximal 3 Elemente pro Task');
  if (elements.length > 0 && !startFrame) {
    throw new Error('Bei Kling-Elementreferenzen ist ein Startframe erforderlich');
  }

  const imageUrls = [];
  if (startFrame) imageUrls.push(startFrame);
  if (lastFrame && !multiShots) imageUrls.push(lastFrame);

  const input = {
    prompt: multiShots ? '' : prompt,
    sound: Boolean(sound),
    duration: String(dur),
    aspect_ratio: aspectRatio,
    mode,
    multi_shots: Boolean(multiShots),
    multi_prompt: multiShots ? multiPrompt : [],
  };
  if (imageUrls.length) input.image_urls = imageUrls;
  if (elements.length) input.kling_elements = elements;

  const payload = {
    model: 'kling-3.0/video',
    input,
  };
  if (callBackUrl) payload.callBackUrl = callBackUrl;

  const response = await axios.post(`${KIE_BASE_URL}/jobs/createTask`, payload, { headers: getHeaders() });
  const data = response.data?.data || response.data;
  if (data?.code && String(data.code) !== '200') {
    throw new Error(data.msg || `Kling 3.0 Start fehlgeschlagen (Code ${data.code})`);
  }
  return response.data;
}

// Legacy Video-Status pruefen
async function checkVideoStatus(taskId) {
  const response = await axios.get(`${KIE_BASE_URL}/video/task/${taskId}`, { headers: getHeaders() });
  return response.data;
}

// Market Task Status fuer Kling 3.0 und andere /jobs/createTask Modelle.
// KIE liefert resultJson als JSON-String; creditsConsumed wird unveraendert durchgereicht.
async function checkMarketTask(taskId) {
  const response = await axios.get(`${KIE_BASE_URL}/jobs/recordInfo`, {
    params: { taskId },
    headers: getHeaders(),
  });
  const payload = response.data || {};
  const data = payload.data || payload;

  let result = null;
  if (data.resultJson) {
    try {
      result = typeof data.resultJson === 'string' ? JSON.parse(data.resultJson) : data.resultJson;
    } catch {
      result = null;
    }
  }

  const resultUrls = result?.resultUrls || [];
  return {
    ...payload,
    taskId: data.taskId || taskId,
    model: data.model,
    state: data.state,
    status: data.state,
    progress: data.progress,
    result_url: resultUrls[0] || result?.resultUrl || null,
    result_urls: resultUrls,
    first_frame_url: result?.firstFrameUrl || null,
    last_frame_url: result?.lastFrameUrl || null,
    credits_consumed: data.creditsConsumed,
    fail_code: data.failCode || null,
    fail_msg: data.failMsg || null,
  };
}

// BILD GENERIERUNG: WAN 2.7 (Primary — Anime-spezialisiert, Batch bis 12)
async function generateImageWan27(prompt, referenceImageUrls, count) {
  const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls : [];
  const payload = {
    model: 'wan-2.7',
    prompt,
    count: Math.min(count || 1, 12),
  };
  if (refs.length > 0) {
    payload.reference_images = refs;
  }

  const response = await axios.post(`${KIE_BASE_URL}/image/generate`, payload, { headers: getHeaders() });
  return response.data;
}

// BILD GENERIERUNG: Nano Banana Pro (Fallback — bis zu 8 Referenzbilder)
async function generateImageNanaBanana(prompt, referenceImageUrls, resolution) {
  const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls : [];
  const payload = {
    model: 'nano-banana-pro',
    prompt,
    resolution: resolution || '2k',
  };
  if (refs.length > 0) {
    payload.reference_images = refs.slice(0, 8);
  }

  const response = await axios.post(`${KIE_BASE_URL}/image/generate`, payload, { headers: getHeaders() });
  return response.data;
}

// BILD STATUS pruefen
async function checkImageStatus(taskId) {
  const response = await axios.get(`${KIE_BASE_URL}/image/task/${taskId}`, { headers: getHeaders() });
  return response.data;
}

// LLM: Szenen generieren
async function generateScenesWithLLM(storyData) {
  const systemPrompt = `Du bist ein kreativer Drehbuchautor fuer KI-generierte Videos.\nErstelle strukturierte Szenen im JSON-Format basierend auf der Story-Idee.\nAntworte NUR mit validem JSON, ohne Markdown oder Code-Bloecke.`;

  const userPrompt = `Erstelle ${storyData.sceneCount || 3} Szenen fuer folgende Story:\n\nGenre: ${storyData.genre || 'Anime'}\nStimmung: ${storyData.mood || 'Abenteuerlich'}\nIdee: ${storyData.idea}\nCharakter: ${storyData.characterDescription || 'Hauptcharakter'}\nZielplattform: ${storyData.targetPlatform || 'TikTok'}\nSprache: ${storyData.language || 'Deutsch'}\n\nAntworte mit JSON-Array:\n[\n  {\n    \"scene_number\": 1,\n    \"title\": \"Szenentitel\",\n    \"content\": \"Beschreibung was passiert\",\n    \"camera_notes\": \"Kamerafuehrung und Winkel\",\n    \"audio_notes\": \"Dialog oder Geraeusche\",\n    \"prompt\": \"Englischer Prompt fuer die KI-Video-Generierung\",\n    \"model_recommendation\": \"grok|veo31|kling3\",\n    \"estimated_coins\": 20\n  }\n]`;

  const response = await axios.post(
    `${KIE_BASE_URL}/chat/completions`,
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
    },
    { headers: getHeaders() }
  );

  const content = response.data.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('LLM hat kein valides JSON zurueckgegeben');
  }
}

module.exports = {
  COIN_COSTS,
  getCoinCost,
  checkKieCredits,
  generateVideoGrok,
  generateVideoVeo31Fast,
  generateVideoKling3,
  checkVideoStatus,
  checkMarketTask,
  generateImageWan27,
  generateImageNanaBanana,
  checkImageStatus,
  generateScenesWithLLM,
};

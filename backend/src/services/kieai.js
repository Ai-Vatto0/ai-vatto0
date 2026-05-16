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
  wan27_image: 8,       // WAN 2.7 Primary (~$0.04 → 8 Coins)
  nano_banana_2k: 18,   // Fallback
  nano_banana_4k: 24,
  scene_generation: 5,
};

function getCoinCost(model, duration, resolution) {
  if (model === 'grok') {
    const key = `grok_${duration}s_${resolution}`;
    return COIN_COSTS[key] || 20;
  }
  if (model === 'veo31') {
    return COIN_COSTS.veo31_fast;
  }
  return 20;
}

// KIE.AI CREDIT MONITORING — vor jeder Generation prüfen
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
    return false; // Bei Fehler blockieren — Sicherheit vor Verfügbarkeit
  }
}

// VIDEO GENERIERUNG: Grok (Multi-Referenz — Kie aktuell 1 Bild, Architektur für 7 vorbereitet)
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

// VIDEO STATUS prüfen
async function checkVideoStatus(taskId) {
  const response = await axios.get(`${KIE_BASE_URL}/video/task/${taskId}`, { headers: getHeaders() });
  return response.data;
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

// BILD STATUS prüfen
async function checkImageStatus(taskId) {
  const response = await axios.get(`${KIE_BASE_URL}/image/task/${taskId}`, { headers: getHeaders() });
  return response.data;
}

// LLM: Szenen generieren
async function generateScenesWithLLM(storyData) {
  const systemPrompt = `Du bist ein kreativer Drehbuchautor für KI-generierte Videos.
Erstelle strukturierte Szenen im JSON-Format basierend auf der Story-Idee.
Antworte NUR mit validem JSON, ohne Markdown oder Code-Blöcke.`;

  const userPrompt = `Erstelle ${storyData.sceneCount || 3} Szenen für folgende Story:

Genre: ${storyData.genre || 'Anime'}
Stimmung: ${storyData.mood || 'Abenteuerlich'}
Idee: ${storyData.idea}
Charakter: ${storyData.characterDescription || 'Hauptcharakter'}
Zielplattform: ${storyData.targetPlatform || 'TikTok'}
Sprache: ${storyData.language || 'Deutsch'}

Antworte mit JSON-Array:
[
  {
    "scene_number": 1,
    "title": "Szenentitel",
    "content": "Beschreibung was passiert",
    "camera_notes": "Kameraführung und Winkel",
    "audio_notes": "Dialog oder Geräusche",
    "prompt": "Englischer Prompt für die KI-Video-Generierung",
    "model_recommendation": "grok|veo31",
    "estimated_coins": 20
  }
]`;

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
  if (!content) throw new Error('LLM hat keine Antwort zurückgegeben');

  // Markdown-Code-Blöcke entfernen (```json ... ```)
  const cleaned = content.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('LLM hat kein valides JSON zurückgegeben');
  }
}

async function withRetry(fn, { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 15000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable =
        !err.response ||
        err.code === 'ECONNABORTED' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNRESET' ||
        (err.response?.status >= 500 && err.response?.status < 600) ||
        err.response?.status === 429;

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 500, maxDelayMs);
      await sleep(delay);
    }
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  COIN_COSTS,
  getCoinCost,
  checkKieCredits,
  generateVideoGrok,
  generateVideoVeo31Fast,
  checkVideoStatus,
  generateImageWan27,
  generateImageNanaBanana,
  checkImageStatus,
  generateScenesWithLLM,
  withRetry,
  sleep,
};

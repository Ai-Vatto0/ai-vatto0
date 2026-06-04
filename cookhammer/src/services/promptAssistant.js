// ─────────────────────────────────────────────────────────────
// KI-Prompt-Assistent – ruft die Edge Function `analyze-image`.
// Diese Function hält den ANTHROPIC_API_KEY serverseitig (Claude Vision).
//
// Eingabe : Bild-URL + kurze Beschreibung + Zielformat
// Ausgabe : strukturiertes JSON (grokPrompt, hook, adAnalysis, structure, variants)
// ─────────────────────────────────────────────────────────────
import { fnUrl, supaHeaders } from '../config'

/**
 * @param {object} p
 * @param {string} p.imageUrl     - öffentliche Bild-URL
 * @param {string} p.brief        - kurze Beschreibung ("Werbevideo für Hochdruckreiniger")
 * @param {string} p.aspectRatio
 * @param {number} p.duration
 * @param {string} fnAnalyze
 * @returns {Promise<AssistantResult>}
 */
/**
 * @param {'tiktok-shop'|'fight-action'|'animal-hook'|'cinematic'} mode
 */
export async function analyzeAndBuildPrompts({ imageUrl, imageUrls, brief, aspectRatio, duration, mode = 'tiktok-shop' }, fnAnalyze) {
  // Bis zu 4 Bilder als Produktsheet. imageUrls (Array) bevorzugt, imageUrl (einzeln) abwärtskompatibel.
  const urls = (Array.isArray(imageUrls) && imageUrls.length ? imageUrls : [imageUrl]).filter(Boolean).slice(0, 4)
  const res = await fetch(fnUrl(fnAnalyze), {
    method: 'POST',
    headers: supaHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ image_urls: urls, image_url: urls[0], brief, aspect_ratio: aspectRatio, duration, mode }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `analyze-image fehlgeschlagen (${res.status})`)
  }
  return data
}

/**
 * @typedef {Object} AssistantResult
 * @property {string}   sceneAnalysis  - kurze Bild-/Szenenanalyse
 * @property {string[]} variants        - [Version A, B, C] fertige Grok-Prompts
 * @property {string}   hook            - Hook-Vorschlag Sekunde 0–1
 * @property {{problem:string, solution:string, cta:string}|null} adAnalysis
 * @property {{label:string, text:string}[]} structure - Zeitachse (0–3s Hook ...)
 */

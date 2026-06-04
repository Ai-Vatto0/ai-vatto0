// ─────────────────────────────────────────────────────────────
// GROK API – isolierter Vertrag zur Supabase Edge Function.
//
// ⚠️ EINZIGE STELLE, die vom genauen Request/Response-Format der
//    Edge Functions abhängt. Wenn dein create-grok-task /
//    get-grok-task andere Feldnamen nutzt, NUR hier anpassen.
//
// Bestätigt aus deinem Test:
//   create-grok-task → { status:'submitted', taskId, provider, model }
//   kie.ai darunter   → image_urls maxItems: 1  (eine URL)
// ─────────────────────────────────────────────────────────────
import { fnUrl, supaHeaders, CONFIG } from '../config'

/**
 * Erstellt einen Grok-Video-Task.
 * Ruft die Function auf, die intern POST /jobs/createTask macht (Slug: get-grok-task).
 * Bestätigter Body: { prompt, image_urls:[url], aspect_ratio, resolution, duration }
 * @param {object} p
 * @param {string} p.prompt
 * @param {string} p.imageUrl       - öffentliche Bild-URL (Supabase Storage); optional
 * @param {string} p.aspectRatio    - "9:16" | "1:1" | "16:9"
 * @param {number} p.duration       - Sekunden (6,8,10,12,15)
 * @param {string} [p.resolution]   - z.B. "480p" | "720p"
 * @param {string} fnCreate         - Function-Slug, der den Task erstellt
 * @returns {Promise<{taskId:string, raw:object}>}
 */
export async function createTask({ prompt, imageUrl, aspectRatio, duration, resolution }, fnCreate) {
  const res = await fetch(fnUrl(fnCreate), {
    method: 'POST',
    headers: supaHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      prompt,
      image_urls: imageUrl ? [imageUrl] : [], // kie.ai: maxItems 1
      aspect_ratio: aspectRatio || 'auto',
      resolution: resolution || CONFIG.resolution,
      duration: duration || 8,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.status === 'failed') {
    throw new Error(data.error || data.msg || `Task-Erstellung fehlgeschlagen (${res.status})`)
  }

  const taskId = data.taskId ?? data.task_id ?? data.data?.taskId ?? data.id
  if (!taskId) throw new Error('Keine taskId erhalten')
  return { taskId, raw: data }
}

/**
 * Fragt den Status eines Tasks ab.
 * Ruft die Function auf, die intern GET /jobs/recordInfo macht (Slug: create-grok-task).
 * Bestätigter Body: { task_id }. Antwort: { status, state, video_url, fail_msg }.
 * @returns {Promise<{status:string, progress:number, videoUrl:string|null, error:string|null}>}
 */
export async function getTask(taskId, fnGet) {
  const res = await fetch(fnUrl(fnGet), {
    method: 'POST',
    headers: supaHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ task_id: taskId }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.msg || `Status-Check fehlgeschlagen (${res.status})`)
  }

  const videoUrl = data.video_url ?? data.videoUrl ?? null

  return {
    status: normalizeStatus(data.status ?? data.state),
    progress: Number(data.progress ?? 0),
    videoUrl,
    error: data.fail_msg ?? data.failMsg ?? data.error ?? null,
  }
}

// kie.ai / Grok Status → einheitliche interne Status
export function normalizeStatus(raw) {
  const map = {
    submitted: 'running', pending: 'pending', queued: 'pending', queuing: 'pending', waiting: 'pending',
    processing: 'running', running: 'running', generating: 'running', in_progress: 'running',
    success: 'succeeded', succeeded: 'succeeded', completed: 'succeeded', done: 'succeeded',
    error: 'failed', failed: 'failed', fail: 'failed',
  }
  return map[String(raw ?? '').toLowerCase()] ?? 'pending'
}

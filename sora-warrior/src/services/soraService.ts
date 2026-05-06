/**
 * Sora 2 Pro API Service
 *
 * Alle Calls laufen über lokale Vercel Serverless Functions (/api/*),
 * damit der SORA_API_KEY niemals im Browser exponiert wird.
 *
 * Flow: createSoraTask() → taskId → pollSoraTask() → videoUrl
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface SoraGenerationParams {
  prompt: string
  imageData?: string          // Base64 data URL — nur für Image-to-Video
  aspectRatio?: 'portrait' | 'landscape'
  nFrames?: 10 | 15 | 25
}

export interface CreateTaskResult {
  taskId: string
  creditsCost: number
}

export interface PollResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
}

export interface GenerateResult {
  success: boolean
  videoUrl?: string
  taskId?: string   // Für Retry bei Fehler gespeichert
  error?: string
}

export type ProgressCallback = (status: string, progress: number) => void

// ─── Interne Hilfsfunktion ────────────────────────────────────────────────────

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    // 402 = Credits aufgebraucht
    if (res.status === 402) {
      throw new Error('Nicht genug Credits. Bitte kaufe weitere Credits im FSG AI Dashboard.')
    }
    const text = await res.text().catch(() => 'Unbekannter Fehler')
    throw new Error(`API Fehler ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ─── Schritt 1: Task erstellen ─────────────────────────────────────────────────

export async function createSoraTask(params: SoraGenerationParams): Promise<CreateTaskResult> {
  return apiRequest<CreateTaskResult>('/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: params.prompt,
      imageData: params.imageData,
      aspectRatio: params.aspectRatio ?? 'landscape',
    }),
  })
}

// ─── Schritt 2: Status einmalig prüfen ────────────────────────────────────────

export async function checkSoraTaskStatus(taskId: string): Promise<PollResult> {
  const data = await apiRequest<{
    status: string
    progress?: number
    result_url?: string
    error_message?: string
  }>('/api/check-status', {
    method: 'POST',
    body: JSON.stringify({ taskId }),  // POST mit Body — laut FSG AI Doku
  })

  return {
    status: normalizeStatus(data.status),
    progress: data.progress ?? 0,
    videoUrl: data.result_url ?? undefined,
    error: data.error_message ?? undefined,
  }
}

// ─── Schritt 2 (Polling-Loop): Bis fertig pollen ──────────────────────────────

export async function pollSoraTask(
  taskId: string,
  onProgress?: ProgressCallback,
  maxRetries = 120,    // 120 × 1s = 2 Minuten
  intervalMs = 1000
): Promise<PollResult> {
  for (let retries = 0; retries < maxRetries; retries++) {
    const result = await checkSoraTaskStatus(taskId)
    // Fortschritt: 10–95% während Polling, damit User weiß dass was passiert
    const percent = Math.round(10 + (retries / maxRetries) * 85)
    onProgress?.(result.status, percent)

    if (result.status === 'completed') {
      return result
    }
    if (result.status === 'failed') {
      return result
    }

    await new Promise<void>((resolve) => setTimeout(resolve, intervalMs))
  }

  return {
    status: 'failed',
    progress: 0,
    error: 'Timeout: Video-Generierung dauert länger als 2 Minuten.',
  }
}

// ─── Kompletter Flow: Create + Poll ───────────────────────────────────────────

export async function generateSoraVideo(
  params: SoraGenerationParams,
  onProgress?: ProgressCallback
): Promise<GenerateResult> {
  try {
    onProgress?.('Starte Generierung…', 5)

    const task = await createSoraTask(params)
    console.log(`[soraService] Task erstellt: ${task.taskId} (${task.creditsCost} Credits)`)
    onProgress?.('Task erstellt, warte auf Video…', 10)

    const result = await pollSoraTask(task.taskId, onProgress)

    if (result.status === 'completed' && result.videoUrl) {
      onProgress?.('Fertig!', 100)
      return { success: true, videoUrl: result.videoUrl, taskId: task.taskId }
    }

    return {
      success: false,
      taskId: task.taskId,
      error: result.error ?? 'Unbekannter Fehler bei der Generierung.',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[soraService] Fehler:', message)
    return { success: false, error: message }
  }
}

// ─── Convenience-Funktionen ───────────────────────────────────────────────────

/** Text-to-Video — kein Bild erforderlich */
export async function generateSoraTextToVideo(
  prompt: string,
  onProgress?: ProgressCallback,
  aspectRatio: 'portrait' | 'landscape' = 'landscape'
): Promise<GenerateResult> {
  return generateSoraVideo({ prompt, aspectRatio }, onProgress)
}

/** Image-to-Video — Bild als Base64 Data URL */
export async function generateSoraImageToVideo(
  imageData: string,
  prompt: string,
  onProgress?: ProgressCallback,
  aspectRatio: 'portrait' | 'landscape' = 'landscape'
): Promise<GenerateResult> {
  return generateSoraVideo({ prompt, imageData, aspectRatio }, onProgress)
}

// ─── Intern: Status normalisieren ─────────────────────────────────────────────

function normalizeStatus(raw: string | undefined): PollResult['status'] {
  const map: Record<string, PollResult['status']> = {
    pending:    'pending',
    queued:     'pending',
    queuing:    'pending',
    waiting:    'pending',
    processing: 'processing',
    running:    'processing',
    generating: 'processing',
    success:    'completed',
    succeeded:  'completed',
    completed:  'completed',
    done:       'completed',
    error:      'failed',
    failed:     'failed',
    fail:       'failed',
  }
  return map[raw?.toLowerCase() ?? ''] ?? 'pending'
}

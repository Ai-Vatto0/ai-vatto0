import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadImage } from '../services/storage'
import { createTask, getTask } from '../services/grokApi'
import { CONFIG } from '../config'

// Status-Lebenszyklus einer Generierung
export const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  CREATING: 'creating',
  RUNNING: 'running',
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
}

const POLL_INTERVAL = 3000        // Grok-Video braucht Minuten → 3s reicht
const MAX_POLLS = 200             // 200 × 3s = 10 Min Timeout
const ACTIVE_KEY = 'cookhammer.activeTask'

// Aktiven Task persistieren → nach App-Neustart/Reload weiterpollen
function saveActive(task) {
  try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(task)) } catch { /* */ }
}
function loadActive() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null') } catch { return null }
}
function clearActive() {
  try { localStorage.removeItem(ACTIVE_KEY) } catch { /* */ }
}

/**
 * @param {object} cb
 * @param {(p:{videoUrl:string, task:object})=>void} cb.onSuccess
 */
export function useGenerate({ onSuccess } = {}) {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [taskId, setTaskId] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)

  const intervalRef = useRef(null)
  const pollCountRef = useRef(0)
  const activeRef = useRef(null) // gemerkte Task-Metadaten (prompt, ratio …)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPolling = useCallback((id) => {
    stopPolling()
    pollCountRef.current = 0
    setStatus(STATUS.RUNNING)

    intervalRef.current = setInterval(async () => {
      pollCountRef.current++
      if (pollCountRef.current > MAX_POLLS) {
        stopPolling()
        setStatus(STATUS.FAILED)
        setError('Timeout: Rendering dauert ungewöhnlich lange. Task-ID gemerkt — später erneut prüfen.')
        return
      }
      try {
        const r = await getTask(id, CONFIG.fn.getTask)
        setProgress(r.progress || 0)

        if (r.status === 'succeeded' && r.videoUrl) {
          stopPolling()
          clearActive()
          setVideoUrl(r.videoUrl)
          setProgress(100)
          setStatus(STATUS.SUCCEEDED)
          onSuccess?.({ videoUrl: r.videoUrl, task: { ...activeRef.current, taskId: id, videoUrl: r.videoUrl } })
        } else if (r.status === 'failed') {
          stopPolling()
          clearActive()
          setStatus(STATUS.FAILED)
          setError(r.error || 'Generierung fehlgeschlagen.')
        } else {
          setStatus(r.status === 'pending' ? STATUS.PENDING : STATUS.RUNNING)
        }
      } catch (err) {
        // Netzfehler beim Pollen sind nicht fatal — nächster Tick versucht es erneut
        console.warn('[poll]', err.message)
      }
    }, POLL_INTERVAL)
  }, [stopPolling, onSuccess])

  // Beim Mounten: offenen Task fortsetzen (z. B. PWA war geschlossen)
  useEffect(() => {
    const active = loadActive()
    if (active?.taskId) {
      activeRef.current = active
      setTaskId(active.taskId)
      startPolling(active.taskId)
    }
    return stopPolling
  }, [startPolling, stopPolling])

  /**
   * Kompletter Flow: Bild hochladen → Task erstellen → pollen.
   * @param {{file:File, imageUrl?:string, prompt:string, aspectRatio:string, duration:number}} p
   */
  const generate = useCallback(async ({ file, imageUrl, prompt, aspectRatio, duration }) => {
    setError(null); setVideoUrl(null); setProgress(0); setTaskId(null)
    try {
      // 1) Bild hochladen (falls noch keine URL vorhanden)
      let url = imageUrl
      if (!url) {
        if (!file) throw new Error('Kein Bild ausgewählt.')
        setStatus(STATUS.UPLOADING)
        url = await uploadImage(file)
      }

      // 2) Task erstellen
      setStatus(STATUS.CREATING)
      const { taskId: id } = await createTask({ prompt, imageUrl: url, aspectRatio, duration }, CONFIG.fn.createTask)

      // 3) Merken + pollen
      const meta = { taskId: id, prompt, aspectRatio, duration, imageUrl: url, createdAt: Date.now() }
      activeRef.current = meta
      saveActive(meta)
      setTaskId(id)
      startPolling(id)
    } catch (err) {
      setStatus(STATUS.FAILED)
      setError(err.message)
    }
  }, [startPolling])

  const reset = useCallback(() => {
    stopPolling(); clearActive()
    setStatus(STATUS.IDLE); setProgress(0); setError(null); setTaskId(null); setVideoUrl(null)
    activeRef.current = null
  }, [stopPolling])

  const isBusy = [STATUS.UPLOADING, STATUS.CREATING, STATUS.RUNNING, STATUS.PENDING].includes(status)

  return { status, progress, error, taskId, videoUrl, generate, reset, isBusy }
}

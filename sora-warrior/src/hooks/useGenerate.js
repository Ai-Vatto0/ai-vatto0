import { useState, useRef, useCallback } from 'react'
import { generateVideo, checkStatus } from '../services/soraApi'
import { STATUS } from '../types/index'

const POLL_INTERVAL = 1000       // 1 Sekunde — FSG AI erfordert schnelles Polling
const MAX_RETRIES = 3            // Anzahl Auto-Retries bei Fehler
const MAX_POLL_RETRIES = 120     // 120 Polls × 1s = 2 Minuten Timeout

export function useGenerate({ onSuccess, onCreditsRefresh }) {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)

  const intervalRef = useRef(null)
  const retryCountRef = useRef(0)
  const pollCountRef = useRef(0)
  const lastParamsRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPolling = useCallback((taskId) => {
    stopPolling()
    pollCountRef.current = 0
    intervalRef.current = setInterval(async () => {
      pollCountRef.current++

      // 2-Minuten-Timeout nach MAX_POLL_RETRIES Versuchen
      if (pollCountRef.current > MAX_POLL_RETRIES) {
        stopPolling()
        setStatus(STATUS.FAILED)
        setError('Timeout: Video-Generierung dauert länger als 2 Minuten. Bitte erneut versuchen.')
        return
      }

      try {
        const data = await checkStatus(taskId)
        const normalized = normalizeStatus(data.status)
        setProgress(data.progress ?? 0)

        if (normalized === STATUS.SUCCEEDED) {
          stopPolling()
          const videoUrl = data.result_url ?? data.video_url ?? data.output_url ?? data.url
          setCurrentVideo(videoUrl)
          setStatus(STATUS.SUCCEEDED)
          setProgress(100)
          onSuccess?.({ videoUrl })
          onCreditsRefresh?.()
        } else if (normalized === STATUS.FAILED) {
          stopPolling()
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++
            console.warn(`[useGenerate] Retry ${retryCountRef.current}/${MAX_RETRIES}`)
            setTimeout(() => {
              if (lastParamsRef.current) {
                startGeneration(lastParamsRef.current)
              }
            }, 2000)
          } else {
            setStatus(STATUS.FAILED)
            setError(data.error_message ?? 'Video-Generierung fehlgeschlagen (3 Versuche).')
          }
        } else {
          setStatus(normalized)
        }
      } catch (err) {
        console.error('[useGenerate] poll error:', err)
      }
    }, POLL_INTERVAL)
  }, [stopPolling, onSuccess, onCreditsRefresh])

  const startGeneration = useCallback(async ({ imageData, prompt, aspectRatio }) => {
    setError(null)
    setCurrentVideo(null)
    setProgress(0)
    setStatus(STATUS.PENDING)
    lastParamsRef.current = { imageData, prompt, aspectRatio }

    try {
      const data = await generateVideo({ imageData, prompt, aspectRatio })
      const taskId = data.taskId ?? data.task_id ?? data.id ?? data.request_id
      if (!taskId) throw new Error('No taskId returned from API')
      setStatus(STATUS.RUNNING)
      startPolling(taskId)
    } catch (err) {
      console.error('[useGenerate] generate error:', err)
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        setTimeout(() => startGeneration({ imageData, prompt, aspectRatio }), 2000)
      } else {
        setStatus(STATUS.FAILED)
        setError(err.message)
      }
    }
  }, [startPolling])

  const generate = useCallback(({ imageData, prompt, aspectRatio }) => {
    retryCountRef.current = 0
    startGeneration({ imageData, prompt, aspectRatio })
  }, [startGeneration])

  const reset = useCallback(() => {
    stopPolling()
    setStatus(STATUS.IDLE)
    setProgress(0)
    setError(null)
    setCurrentVideo(null)
    retryCountRef.current = 0
    pollCountRef.current = 0
    lastParamsRef.current = null
  }, [stopPolling])

  return { status, progress, error, currentVideo, generate, reset, isGenerating: status === STATUS.PENDING || status === STATUS.RUNNING }
}

function normalizeStatus(raw) {
  const map = {
    pending: STATUS.PENDING,
    queued: STATUS.PENDING,
    queuing: STATUS.PENDING,
    waiting: STATUS.PENDING,
    processing: STATUS.RUNNING,
    running: STATUS.RUNNING,
    generating: STATUS.RUNNING,
    success: STATUS.SUCCEEDED,
    succeeded: STATUS.SUCCEEDED,
    completed: STATUS.SUCCEEDED,
    done: STATUS.SUCCEEDED,
    error: STATUS.FAILED,
    failed: STATUS.FAILED,
    fail: STATUS.FAILED,
  }
  return map[raw?.toLowerCase()] ?? STATUS.PENDING
}

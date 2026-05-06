import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, MAX_VIDEOS, CREDITS_PER_VIDEO } from '../types/index'

export function useVideos() {
  const [videos, setVideos] = useLocalStorage(STORAGE_KEYS.VIDEOS, [])

  const addVideo = useCallback(({ imageId, prompt, aspectRatio, videoUrl, status = 'succeeded' }) => {
    const newVideo = {
      id: `video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      imageId,
      prompt,
      aspectRatio,
      videoUrl,
      generatedAt: new Date().toISOString(),
      credits: CREDITS_PER_VIDEO,
      status,
    }
    setVideos((prev) => {
      const updated = [newVideo, ...prev]
      return updated.slice(0, MAX_VIDEOS) // auto-prune oldest
    })
    return newVideo.id
  }, [setVideos])

  const removeVideo = useCallback((id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }, [setVideos])

  return { videos, addVideo, removeVideo }
}

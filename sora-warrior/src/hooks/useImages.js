import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, MAX_IMAGES } from '../types/index'

export function useImages() {
  const [images, setImages] = useLocalStorage(STORAGE_KEYS.IMAGES, [])

  const addImage = useCallback((base64) => {
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newImage = {
      id,
      base64,
      thumbnail: base64, // same for now; could be resized
      uploadedAt: new Date().toISOString(),
      usedCount: 0,
    }
    setImages((prev) => {
      const updated = [newImage, ...prev]
      return updated.slice(0, MAX_IMAGES)
    })
    return id
  }, [setImages])

  const markUsed = useCallback((id) => {
    setImages((prev) =>
      prev.map((img) => img.id === id ? { ...img, usedCount: img.usedCount + 1 } : img)
    )
  }, [setImages])

  const removeImage = useCallback((id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [setImages])

  const getById = useCallback((id) => {
    return images.find((img) => img.id === id) ?? null
  }, [images])

  return { images, addImage, markUsed, removeImage, getById }
}

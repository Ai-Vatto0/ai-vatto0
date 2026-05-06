import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, MAX_PROMPTS } from '../types/index'

export function usePrompts() {
  const [prompts, setPrompts] = useLocalStorage(STORAGE_KEYS.PROMPTS, [])

  const addPrompt = useCallback((text) => {
    if (!text?.trim()) return
    setPrompts((prev) => {
      // Update usedCount if already exists
      const existing = prev.find((p) => p.text === text)
      if (existing) {
        return [
          { ...existing, usedCount: existing.usedCount + 1 },
          ...prev.filter((p) => p.text !== text),
        ].slice(0, MAX_PROMPTS)
      }
      const newPrompt = {
        id: `prompt_${Date.now()}`,
        text,
        usedCount: 1,
        createdAt: new Date().toISOString(),
      }
      return [newPrompt, ...prev].slice(0, MAX_PROMPTS)
    })
  }, [setPrompts])

  const removePrompt = useCallback((id) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }, [setPrompts])

  return { prompts, addPrompt, removePrompt }
}

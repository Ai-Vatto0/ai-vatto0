import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Projekt-/Video-Historie (Bonus-Feature). Persistiert lokal auf dem Gerät.
// Ein "Projekt" = ein abgeschlossener oder laufender Generierungs-Versuch.
export function useProjects() {
  const [projects, setProjects] = useLocalStorage('cookhammer.projects', [])

  const addProject = useCallback((p) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...p,
    }
    setProjects((prev) => [entry, ...prev].slice(0, 100)) // max 100
    return entry
  }, [setProjects])

  const removeProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [setProjects])

  const clearAll = useCallback(() => setProjects([]), [setProjects])

  return { projects, addProject, removeProject, clearAll }
}

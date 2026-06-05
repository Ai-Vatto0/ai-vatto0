import { useState, useCallback, useEffect } from 'react'

// Kleiner localStorage-State-Hook (synchronisiert über Tabs/Reloads).
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Speicher voll / privater Modus → ignorieren */
    }
  }, [key, value])

  const update = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next))
  }, [])

  return [value, update]
}

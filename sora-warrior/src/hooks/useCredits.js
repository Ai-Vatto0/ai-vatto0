import { useState, useEffect, useCallback } from 'react'
import { getCredits } from '../services/soraApi'

export function useCredits() {
  const [credits, setCredits] = useState(null)
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState(null)

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCredits()
      setCredits(data.left_credits ?? data.credits ?? data.balance ?? 0)
      setIsVip(data.is_vip ?? false)
      setLastFetched(Date.now())
    } catch (err) {
      console.error('[useCredits] fetch failed:', err)
      // Keep last known value on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return { credits, isVip, loading, refresh: fetchCredits, lastFetched }
}

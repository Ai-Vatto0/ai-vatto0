import { createContext, useContext, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

// ─────────────────────────────────────────────────────────────
// Globaler App-State: TOX-Wallet + Navigation + Studio-Unlock.
// Dependency-frei (React Context), localStorage-persistiert.
// ─────────────────────────────────────────────────────────────

export const TEST_BALANCE = 10000     // Tester-Startguthaben
export const COST_IDEAS = 25          // Ideen-Set generieren
export const COST_VIDEO = 250         // 1 Video erstellen

const DEFAULT_WALLET = { tox: TEST_BALANCE, consumed: 0, videoCount: 0 }

const AppCtx = createContext(null)

export function AppStoreProvider({ children }) {
  const [wallet, setWallet] = useLocalStorage('toktok.wallet', DEFAULT_WALLET)
  const [studioUnlocked, setStudioUnlocked] = useLocalStorage('toktok.studio', false)
  const [tab, setTab] = useLocalStorage('toktok.tab', 'home')

  const tox = wallet?.tox ?? 0

  const canAfford = useCallback((cost) => (wallet?.tox ?? 0) >= cost, [wallet])

  /**
   * Zieht Kosten ab und schreibt Statistik fort.
   * @param {number} cost
   * @param {{video?:boolean}} opts  video:true zählt videoCount hoch
   * @returns {boolean} true wenn abgebucht, false bei zu wenig Guthaben
   */
  const charge = useCallback((cost, opts = {}) => {
    let ok = false
    setWallet((prev) => {
      const w = prev || DEFAULT_WALLET
      if (w.tox < cost) return w
      ok = true
      return {
        tox: w.tox - cost,
        consumed: (w.consumed || 0) + cost,
        videoCount: (w.videoCount || 0) + (opts.video ? 1 : 0),
      }
    })
    return ok
  }, [setWallet])

  const addTox = useCallback((amount) => {
    setWallet((prev) => ({ ...(prev || DEFAULT_WALLET), tox: (prev?.tox ?? 0) + amount }))
  }, [setWallet])

  const resetWallet = useCallback(() => setWallet(DEFAULT_WALLET), [setWallet])

  const unlockStudio = useCallback(() => setStudioUnlocked(true), [setStudioUnlocked])
  const lockStudio = useCallback(() => {
    setStudioUnlocked(false)
    setTab('profil')
  }, [setStudioUnlocked, setTab])

  const value = useMemo(() => ({
    tox,
    consumed: wallet?.consumed ?? 0,
    videoCount: wallet?.videoCount ?? 0,
    estimatedVideos: Math.floor(tox / COST_VIDEO),
    canAfford,
    charge,
    addTox,
    resetWallet,
    tab,
    setTab,
    studioUnlocked,
    unlockStudio,
    lockStudio,
  }), [tox, wallet, canAfford, charge, addTox, resetWallet, tab, setTab, studioUnlocked, unlockStudio, lockStudio])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppStoreProvider')
  return ctx
}

// Hilfsformatierung: 10000 → "10.000"
export function formatTox(n) {
  return (n ?? 0).toLocaleString('de-DE')
}

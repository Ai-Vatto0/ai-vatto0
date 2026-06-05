import { useRef } from 'react'
import { useApp, formatTox } from '../store/AppStore'

export function ProfileScreen({ showToast, go }) {
  const { tox, videoCount, studioUnlocked, unlockStudio, lockStudio } = useApp()

  // Versteckter Studio-Unlock: 5× schnell auf das Status-Label tippen.
  const taps = useRef({ n: 0, t: 0 })
  const onSecretTap = () => {
    const now = Date.now()
    const s = taps.current
    s.n = now - s.t < 700 ? s.n + 1 : 1
    s.t = now
    if (s.n >= 5) {
      s.n = 0
      if (!studioUnlocked) { unlockStudio(); showToast?.('Studio entsperrt 🔓', 'success') }
    }
  }

  return (
    <div className="stack">
      {/* Profil-Header */}
      <div className="card stack sm" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center',
          fontSize: 32, background: 'var(--bg-elev)', border: '1px solid var(--border-strong)' }}>👤</div>
        <div onClick={onSecretTap} style={{ userSelect: 'none' }}>
          <span className="studio-tag">TESTER</span>
        </div>
        <div className="muted">Dein TOX-Guthaben: <b style={{ color: 'var(--pink)' }}>TOX {formatTox(tox)}</b></div>
      </div>

      {/* Mini-Stats */}
      <div className="stat-grid">
        <div className="stat"><div className="sv cyan">{videoCount}</div><div className="sl">Videos erstellt</div></div>
        <div className="stat"><div className="sv pink">TOX {formatTox(tox)}</div><div className="sl">Guthaben</div></div>
      </div>

      {/* Aktionen */}
      <div className="stack sm">
        <button className="list-row" onClick={() => go('tox')}>
          <span className="lr-ico">💎</span> TOX aufladen <span className="lr-arrow">›</span>
        </button>
        <button className="list-row" onClick={() => showToast?.('Support: support@toktokshop.app', 'info')}>
          <span className="lr-ico">💬</span> Support <span className="lr-arrow">›</span>
        </button>
        <button className="list-row" onClick={() => showToast?.('Regeln & Hinweise im TOX-Bereich.', 'info')}>
          <span className="lr-ico">📜</span> Regeln & Hinweise <span className="lr-arrow">›</span>
        </button>
      </div>

      {/* Hinweis */}
      <div className="note">
        <span className="ni">ℹ️</span>
        <div>KI-generierte Videos können kleine visuelle Fehler enthalten. TOX werden nur bei erfolgreicher Auslieferung verbraucht.</div>
      </div>

      {/* Verstecktes Studio (nur nach Entsperrung sichtbar) */}
      {studioUnlocked && (
        <div className="stack sm">
          <p className="eyebrow" style={{ margin: '6px 2px 0' }}>Privat</p>
          <button className="list-row" style={{ borderColor: 'rgba(37,244,238,0.4)' }} onClick={() => go('studio')}>
            <span className="lr-ico">🛠️</span> Studio (privat) <span className="lr-arrow">›</span>
          </button>
          <button className="list-row" onClick={() => { lockStudio(); showToast?.('Studio gesperrt 🔒', 'info') }}>
            <span className="lr-ico">🔒</span> Studio sperren <span className="lr-arrow">›</span>
          </button>
        </div>
      )}
    </div>
  )
}

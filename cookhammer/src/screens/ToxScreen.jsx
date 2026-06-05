import { useApp, formatTox } from '../store/AppStore'

const PACKAGES = [
  { id: 'starter', name: 'Starter', tox: 2500, price: '39 €', videos: 'ca. 10 Videos' },
  { id: 'creator', name: 'Creator', tox: 7500, price: '99 €', videos: 'ca. 30 Videos', featured: true },
  { id: 'pro', name: 'Pro', tox: 20000, price: '249 €', videos: 'ca. 80 Videos' },
]

export function ToxScreen({ showToast }) {
  const { tox, consumed, videoCount, estimatedVideos } = useApp()

  return (
    <div className="stack">
      {/* Guthaben */}
      <div className="balance-hero">
        <div className="bl">Dein Guthaben</div>
        <div className="bv"><span className="k">TOX </span>{formatTox(tox)}</div>
        <div className="muted" style={{ marginTop: 4 }}>≈ {estimatedVideos} Videos verbleibend</div>
      </div>

      {/* Statistik */}
      <div className="stat-grid">
        <div className="stat"><div className="sv pink">{formatTox(consumed)}</div><div className="sl">TOX verbraucht</div></div>
        <div className="stat"><div className="sv cyan">{videoCount}</div><div className="sl">Videos erstellt</div></div>
      </div>

      {/* Pakete */}
      <div>
        <p className="eyebrow" style={{ margin: '6px 2px 12px' }}>TOX-Pakete</p>
        <div className="stack sm">
          {PACKAGES.map((p) => (
            <div className={`pkg-card ${p.featured ? 'featured' : ''}`} key={p.id}>
              {p.featured && <span className="pkg-ribbon">Beliebt</span>}
              <div>
                <div className="pkg-amt"><span className="k">TOX </span>{formatTox(p.tox)}</div>
                <div className="pkg-sub">{p.name} · {p.videos}</div>
              </div>
              <div className="pkg-price">
                <div className="p">{p.price}</div>
                <button className={`btn ${p.featured ? 'btn-primary' : 'btn-outline'} btn-sm`} style={{ marginTop: 6 }}
                  onClick={() => showToast?.('Bezahlung kommt bald 💳', 'info')}>Wählen</button>
              </div>
            </div>
          ))}
        </div>
        <p className="faint center" style={{ fontSize: 12, marginTop: 12 }}>Preise sind Platzhalter und werden später angepasst.</p>
      </div>

      {/* Premium-/Erstattungs-Hinweis */}
      <div className="note cyan">
        <span className="ni">✨</span>
        <div>Premium-Qualität für TikTok-Shop-Creator. KI-generierte Videos können kleine visuelle Fehler enthalten.</div>
      </div>
      <div className="note">
        <span className="ni">ℹ️</span>
        <div>TOX werden nur bei erfolgreich ausgeliefertem Video verbraucht. Erstattungen gibt es bei technischen Fehlern oder wenn kein Video ausgeliefert wurde.</div>
      </div>
    </div>
  )
}

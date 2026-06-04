import { useState } from 'react'
import { relativeDay, durationLabel } from '../lib/format'
import { saveVideo } from '../lib/download'

// "Meine Videos" — Liste aller generierten Videos.
export function VideosScreen({ projects, removeProject, go, showToast }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="stack">
        <p className="h2">Meine Videos</p>
        <div className="empty">
          <div className="ee">🎬</div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>Noch keine Videos</div>
          <div className="muted">Erstelle dein erstes verkaufsfertiges Video.</div>
          <button className="btn btn-primary" style={{ maxWidth: 240, margin: '18px auto 0' }} onClick={() => go('generator')}>
            ⬆ Produkt hochladen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="spread">
        <p className="h2">Meine Videos</p>
        <span className="faint" style={{ fontSize: 13 }}>{projects.length} Videos</span>
      </div>

      {projects.map((p) => (
        <VideoCard key={p.id} p={p} onRemove={removeProject} showToast={showToast} />
      ))}
    </div>
  )
}

function VideoCard({ p, onRemove, showToast }) {
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const how = await saveVideo(p.videoUrl, p.title || p.prompt || 'toktok-video')
      showToast?.(how === 'shared' ? 'Zum Sichern in der Galerie öffnen ✅' : 'Video heruntergeladen ⬇', 'success')
    } catch (e) {
      showToast?.(e.message || 'Download fehlgeschlagen', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="vcard">
        <div className="vthumb-wrap">
          {p.videoUrl
            ? <video className="vthumb" src={p.videoUrl} muted playsInline preload="metadata" />
            : <div className="vthumb" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-faint)' }}>⏳</div>}
          {p.duration && <span className="vthumb-dur">{durationLabel(p.duration)}</span>}
        </div>

        <div className="vmeta">
          <div className="vt">{p.title || p.prompt || 'Video'}</div>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{relativeDay(p.createdAt)}</div>
          <div style={{ marginTop: 8 }}>
            {p.videoUrl
              ? <span className="badge ok"><i className="dot" /> Generiert</span>
              : <span className="badge running"><i className="dot pulse" /> In Bearbeitung</span>}
          </div>
        </div>
      </div>

      {p.videoUrl && (
        <div className="row" style={{ gap: 8, marginTop: 14 }}>
          <button className="btn btn-cyan btn-sm" style={{ flex: 1 }} onClick={save} disabled={saving}>
            {saving ? <><i className="spin" /> Speichern…</> : '⬇ In Galerie speichern'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onRemove(p.id)} aria-label="Löschen">🗑</button>
        </div>
      )}
    </div>
  )
}

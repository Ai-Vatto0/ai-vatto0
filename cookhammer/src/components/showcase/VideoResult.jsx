import { useState } from 'react'
import { saveVideo } from '../../lib/download'

// Inline-Video-Player + „In Galerie speichern" für ein frisch fertiges Video.
export function VideoResult({ videoUrl, prompt, title, onNew, showToast }) {
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const how = await saveVideo(videoUrl, title || prompt || 'toktok-video')
      showToast?.(how === 'shared' ? 'Zum Sichern in der Galerie öffnen ✅' : 'Video heruntergeladen ⬇', 'success')
    } catch (e) {
      showToast?.(e.message || 'Download fehlgeschlagen', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <video className="video" src={videoUrl} controls playsInline autoPlay loop muted />
      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
          {saving ? <><i className="spin" /> Speichern…</> : '⬇ In Galerie speichern'}
        </button>
        {onNew && <button className="btn btn-ghost" onClick={onNew}>Neu</button>}
      </div>
      {prompt && <p className="muted" style={{ margin: 0 }}>{prompt}</p>}
    </div>
  )
}

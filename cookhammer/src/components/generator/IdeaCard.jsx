import { useState, useEffect } from 'react'
import { COST_VIDEO } from '../../store/AppStore'

const PROMPT_MAX = 2500   // Grok-Maximum

// Eine fertige Video-Idee: Hook, Story, editierbarer Prompt, Titel, Hashtags, Kommentar.
export function IdeaCard({ idea, index, onCreateVideo, onCopy, busy, affordable }) {
  const hashtags = Array.isArray(idea.hashtags) ? idea.hashtags : []
  const [prompt, setPrompt] = useState(idea.prompt || '')
  const [editing, setEditing] = useState(false)
  // Bei „Neu generieren" (key=index, neue idea-Props) den lokalen Prompt-State zurücksetzen.
  useEffect(() => { setPrompt(idea.prompt || ''); setEditing(false) }, [idea.prompt])
  const copy = (text) => { navigator.clipboard?.writeText(text).then(() => onCopy?.()) }

  const start = () => onCreateVideo?.({ ...idea, prompt: (prompt.trim() || idea.prompt) })

  return (
    <div className="idea-card">
      <div className="idea-head">
        <span className="idea-num">{index + 1}</span>
        <span className="idea-title">{idea.title || `Videoidee ${index + 1}`}</span>
      </div>

      <Field label="Hook" value={idea.hook} onCopy={() => copy(idea.hook)} />
      <Field label="Story" value={idea.story} />

      {(idea.prompt || prompt) && (
        <div className="idea-field">
          <div className="fl">
            Video-Prompt
            <span style={{ display: 'inline-flex', gap: 6 }}>
              <button className="copy-mini" onClick={() => setEditing((v) => !v)}>{editing ? '✓ Fertig' : '✏️ Anpassen'}</button>
              <button className="copy-mini" onClick={() => copy(prompt)}>📋 Kopieren</button>
            </span>
          </div>
          {editing ? (
            <>
              <textarea className="textarea" style={{ minHeight: 120, fontSize: 13 }} maxLength={PROMPT_MAX}
                value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              <div className="faint" style={{ fontSize: 11, textAlign: 'right' }}>{prompt.length}/{PROMPT_MAX}</div>
            </>
          ) : (
            <div className="ft prompt">{prompt}</div>
          )}
        </div>
      )}

      <Field label="Titel" value={idea.title} onCopy={() => copy(idea.title)} />

      {hashtags.length > 0 && (
        <div className="idea-field">
          <div className="fl">Hashtags <button className="copy-mini" onClick={() => copy(hashtags.join(' '))}>📋</button></div>
          <div className="chips">
            {hashtags.map((t, i) => <span key={i} className="chip">{t.startsWith('#') ? t : `#${t}`}</span>)}
          </div>
        </div>
      )}

      <Field label="Erster Kommentar" value={idea.comment} onCopy={() => copy(idea.comment)} />

      <button
        className="btn btn-primary"
        style={{ marginTop: 14 }}
        disabled={busy || !affordable}
        onClick={start}
      >
        {busy ? <><i className="spin" /> Video läuft…</> : `🎬 Video erstellen – ${COST_VIDEO} TOX`}
      </button>
      {!affordable && !busy && (
        <p className="faint center" style={{ fontSize: 12, margin: '8px 0 0' }}>Nicht genug TOX für ein Video</p>
      )}
    </div>
  )
}

function Field({ label, value, onCopy }) {
  if (!value) return null
  return (
    <div className="idea-field">
      <div className="fl">
        {label}
        {onCopy && <button className="copy-mini" onClick={onCopy}>📋</button>}
      </div>
      <div className="ft">{value}</div>
    </div>
  )
}

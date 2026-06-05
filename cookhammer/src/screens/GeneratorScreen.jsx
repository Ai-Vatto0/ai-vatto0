import { useState, useCallback, useRef } from 'react'
import { useApp, COST_IDEAS, COST_VIDEO } from '../store/AppStore'
import { uploadMany } from '../services/storage'
import { analyzeAndBuildPrompts } from '../services/promptAssistant'
import { CONFIG } from '../config'
import { useGenerate, STATUS } from '../hooks/useGenerate'
import { ImageUpload } from '../components/generator/ImageUpload'
import { Stepper } from '../components/generator/Stepper'
import { IdeaCard } from '../components/generator/IdeaCard'
import { StatusBadge } from '../components/status/StatusBadge'
import { VideoResult } from '../components/showcase/VideoResult'

const DURATIONS = [10, 12, 15]   // öffentlich: 10–15s, nichts darunter
const ASPECT = '9:16'            // TikTok-Format

const BENEFITS = [
  { i: '🎬', n: '5', t: 'Videoideen' },
  { i: '⚡', n: '5', t: 'Hooks' },
  { i: '✍️', n: '5', t: 'Prompts' },
  { i: '#', n: '+', t: 'Titel & Hashtags' },
  { i: '💬', n: '1', t: 'Kommentar' },
]

export function GeneratorScreen({ showToast, go, addProject }) {
  const { canAfford, charge } = useApp()

  const [images, setImages] = useState([])         // [{ file, url, uploadedUrl? }]
  const [brief, setBrief] = useState('')
  const [duration, setDuration] = useState(10)

  const [ideas, setIdeas] = useState(null)
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [ideasError, setIdeasError] = useState(null)

  const selectedIdeaRef = useRef(null)
  const chargedRef = useRef(new Set())

  const gen = useGenerate({
    onSuccess: ({ videoUrl, task }) => {
      // TOX erst bei erfolgreicher Auslieferung abziehen — pro Task nur einmal.
      if (task?.taskId && !chargedRef.current.has(task.taskId)) {
        chargedRef.current.add(task.taskId)
        charge(COST_VIDEO, { video: true })
      }
      addProject?.({ ...task, videoUrl, title: selectedIdeaRef.current?.title || task?.prompt })
      showToast?.('Video fertig! 🎬', 'success')
    },
  })

  const addImage = useCallback((file) => {
    setImages((prev) => (prev.length >= 4 ? prev : [...prev, { file, url: URL.createObjectURL(file) }]))
  }, [])
  const removeImage = useCallback((i) => setImages((prev) => prev.filter((_, idx) => idx !== i)), [])

  // Lädt alle noch nicht hochgeladenen Bilder hoch und gibt die URLs in Reihenfolge zurück.
  // Bild 0 = Hauptbild/Referenz (das einzige, das das Video-Modell als Bild nutzt).
  const ensureUploaded = useCallback(async () => {
    const current = images
    const missing = current.filter((img) => !img.uploadedUrl)
    if (missing.length) {
      const urls = await uploadMany(missing.map((m) => m.file))
      let k = 0
      const next = current.map((img) => (img.uploadedUrl ? img : { ...img, uploadedUrl: urls[k++] }))
      setImages(next)
      return next.map((img) => img.uploadedUrl)
    }
    return current.map((img) => img.uploadedUrl)
  }, [images])

  const mainImage = images[0] || null
  const affordIdeas = canAfford(COST_IDEAS)
  const affordVideo = canAfford(COST_VIDEO)

  const current = gen.videoUrl ? 4 : ideas ? 3 : mainImage ? 2 : 1

  // ── Ideen generieren ──
  const runIdeas = async () => {
    if (!mainImage) return showToast?.('Erst ein Produktbild hochladen', 'error')
    if (!affordIdeas) return showToast?.('Nicht genug TOX. Bitte lade dein Guthaben auf.', 'error')
    setIdeasLoading(true); setIdeasError(null); setIdeas(null)
    try {
      const urls = await ensureUploaded()           // alle (bis zu 4) Bilder als Produktsheet
      const r = await analyzeAndBuildPrompts(
        { imageUrls: urls, brief, aspectRatio: ASPECT, duration, mode: 'tiktok-shop' },
        CONFIG.fn.analyze,
      )
      const list = normalizeIdeas(r)
      if (!list.length) throw new Error('Keine Ideen erhalten. Bitte erneut versuchen.')
      if (!charge(COST_IDEAS)) throw new Error('Nicht genug TOX. Bitte lade dein Guthaben auf.')
      setIdeas(list)
      showToast?.('5 Ideen erstellt ✨', 'success')
    } catch (e) {
      setIdeasError(e.message)
    } finally {
      setIdeasLoading(false)
    }
  }

  // ── Video aus einer Idee erstellen ──
  const createVideo = (idea) => {
    if (gen.isBusy) return
    if (!affordVideo) return showToast?.('Nicht genug TOX. Bitte lade dein Guthaben auf.', 'error')
    selectedIdeaRef.current = idea
    gen.generate({
      file: mainImage.file,
      imageUrl: mainImage.uploadedUrl,
      prompt: idea.prompt || idea.hook || idea.title,
      aspectRatio: ASPECT,
      duration,
    })
  }

  return (
    <div className="stack">
      <Stepper current={current} />

      {/* 1 — Produkt hochladen */}
      <div className="card stack sm">
        <p className="h2">1. Produkt hochladen</p>
        <p className="muted" style={{ margin: 0 }}>Lade ein Produktbild oder einen Screenshot hoch. Bild 1 ist dein Hauptbild.</p>
        <ImageUpload images={images} onAdd={addImage} onRemove={removeImage} disabled={gen.isBusy} />
        <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
          Tipp: Nimm bis zu 4 saubere Produktfotos. Bild 1 = Referenz fürs Video — dein klarstes Produktfoto.
        </p>

        <div>
          <label className="label">Eigener Wunsch / Prompt (optional)</label>
          <textarea className="textarea" style={{ minHeight: 60 }} maxLength={250}
            placeholder='z.B. "Akku-Hochdruckreiniger, betone die Reinigung der Terrasse in 30 Sek"'
            value={brief} onChange={(e) => setBrief(e.target.value)} />
          <div className="faint" style={{ fontSize: 11, textAlign: 'right' }}>{brief.length}/250</div>
        </div>
      </div>

      {/* 2 — Ideen generieren */}
      <div className="card stack sm">
        <p className="h2">2. Ideen generieren</p>
        <div className="content-type-card">
          <span className="ct-ico">🛒</span>
          <div>
            <div className="ct-title">TikTok Shop</div>
            <div className="ct-sub">Verkaufsfertige Produktvideos</div>
          </div>
          <span className="ct-check">✓</span>
        </div>

        <div>
          <label className="label">Videolänge</label>
          <div className="seg">
            {DURATIONS.map((d) => (
              <button key={d} type="button" className={`seg-btn ${duration === d ? 'active' : ''}`}
                onClick={() => setDuration(d)}>{d}s</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-col" onClick={runIdeas} disabled={ideasLoading || !mainImage}>
          {ideasLoading
            ? <><i className="spin" /> Produkt wird analysiert… (bis zu 2 Min)</>
            : <>✨ Ideen generieren<span className="sub">benötigt {COST_IDEAS} TOX</span></>}
        </button>
        {!affordIdeas && (
          <div className="note pink"><span className="ni">⚠️</span><div>Nicht genug TOX. Bitte lade dein Guthaben auf.<button className="link" style={{ display: 'block', marginTop: 4 }} onClick={() => go('tox')}>TOX aufladen ›</button></div></div>
        )}
        {ideasError && <div className="banner">{ideasError}</div>}

        <div className="benefits" style={{ marginTop: 4 }}>
          {BENEFITS.map((b, i) => (
            <div className="benefit" key={i}>
              <span className="bi">{b.i}</span>
              <span className="bn">{b.n}</span>
              <span className="bt">{b.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video-Status / Ergebnis */}
      {(gen.status !== STATUS.IDLE) && (
        <div className="card stack sm">
          <div className="spread">
            <StatusBadge status={gen.status} />
          </div>
          {gen.isBusy && <div className="progress"><i style={{ width: `${gen.progress || 8}%` }} /></div>}
          {gen.error && <div className="banner">{gen.error}</div>}
          {gen.status === STATUS.FAILED && <button className="btn btn-ghost" onClick={gen.reset}>Zurücksetzen</button>}
          {gen.videoUrl && (
            <>
              <VideoResult videoUrl={gen.videoUrl} title={selectedIdeaRef.current?.title}
                prompt={selectedIdeaRef.current?.title} onNew={gen.reset} showToast={showToast} />
              <button className="btn btn-cyan" onClick={() => go('videos')}>📁 In „Meine Videos" ansehen</button>
            </>
          )}
        </div>
      )}

      {/* 3 — Ideen-Auswahl */}
      {ideas && (
        <div className="stack">
          <div className="section-head">
            <p className="eyebrow" style={{ margin: 0 }}>Wähle eine Idee</p>
            <button className="link" onClick={runIdeas} disabled={ideasLoading}>Neu generieren</button>
          </div>
          {ideas.map((idea, i) => (
            <IdeaCard key={i} idea={idea} index={i} busy={gen.isBusy} affordable={affordVideo}
              onCreateVideo={createVideo} onCopy={() => showToast?.('Kopiert', 'success')} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Normalisiert die KI-Antwort zu max. 5 Ideen mit einheitlichen Feldern ──
function normalizeIdeas(r) {
  if (Array.isArray(r?.ideas) && r.ideas.length) {
    return r.ideas.slice(0, 5).map((it, i) => ({
      hook: it.hook || '',
      story: it.story || it.concept || '',
      prompt: it.prompt || '',
      title: it.title || `Videoidee ${i + 1}`,
      hashtags: Array.isArray(it.hashtags) ? it.hashtags : [],
      comment: it.comment || it.firstComment || '',
    }))
  }
  // Fallback: aus v4-Struktur (variants/hooks/trailer) zusammenbauen
  const variants = Array.isArray(r?.variants) ? r.variants : []
  const hooks = Array.isArray(r?.hooks) ? r.hooks : []
  const trailer = r?.trailer || {}
  const n = Math.min(5, Math.max(variants.length, hooks.length))
  const out = []
  for (let i = 0; i < n; i++) {
    const v = variants[i] || {}
    out.push({
      hook: hooks[i] || hooks[0] || v.label || '',
      story: v.concept || v.angle || '',
      prompt: v.prompt || '',
      title: trailer.title || v.label || `Videoidee ${i + 1}`,
      hashtags: Array.isArray(trailer.hashtags) ? trailer.hashtags : [],
      comment: trailer.firstComment || '',
    })
  }
  return out
}

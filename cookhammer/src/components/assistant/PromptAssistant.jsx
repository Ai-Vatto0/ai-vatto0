import { useState } from 'react'
import { analyzeAndBuildPrompts } from '../../services/promptAssistant'
import { uploadImage } from '../../services/storage'
import { CONFIG } from '../../config'

// ─────────────────────────────────────────────────────────────
// Mode-Definitionen
// ─────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'tiktok-shop',
    icon: '🛒',
    label: 'TikTok Shop',
    sub: 'Produkt-Werbung',
  },
  {
    id: 'fight-action',
    icon: '⚔️',
    label: 'Action / Anime',
    sub: 'Hollywood / Matrix',
  },
  {
    id: 'animal-hook',
    icon: '🐾',
    label: 'Tier-Hook',
    sub: 'Viral Scrollstopper',
  },
  {
    id: 'cinematic',
    icon: '🎬',
    label: 'Cinematic',
    sub: 'Trailer / Story',
  },
]

// ─────────────────────────────────────────────────────────────
// KI-Prompt-Assistent
// ─────────────────────────────────────────────────────────────
export function PromptAssistant({ mainImage, aspectRatio, duration, onUsePrompt, onUploaded, showToast }) {
  const [mode, setMode] = useState('tiktok-shop')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const run = async () => {
    if (!mainImage?.file && !mainImage?.uploadedUrl) {
      showToast?.('Erst ein Bild hochladen', 'error'); return
    }
    setLoading(true); setError(null); setResult(null)
    try {
      let url = mainImage.uploadedUrl
      if (!url) {
        url = await uploadImage(mainImage.file)
        onUploaded?.(url)
      }
      const r = await analyzeAndBuildPrompts(
        { imageUrl: url, brief, aspectRatio, duration, mode },
        CONFIG.fn.analyze,
      )
      setResult(r)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const modeLabel = MODES.find(m => m.id === mode)?.label || mode

  return (
    <div className="card">
      <p className="card-title">🤖 KI-Prompt-Assistent</p>

      {/* Mode-Selector */}
      <div className="mode-grid" style={{ marginBottom: 12 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            type="button"
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => { setMode(m.id); setResult(null) }}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
            <span className="mode-sub">{m.sub}</span>
          </button>
        ))}
      </div>

      {/* Brief */}
      <textarea
        className="textarea" style={{ minHeight: 64 }}
        placeholder={modeHint(mode)}
        value={brief} onChange={(e) => setBrief(e.target.value)}
      />
      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={run} disabled={loading}>
        {loading ? <><i className="spin light" /> Analysiere…</> : `✨ ${modeLabel}-Prompts generieren`}
      </button>

      {error && <div className="banner" style={{ marginTop: 12 }}>{error}</div>}

      {/* ── Ergebnisse ── */}
      {result && (
        <div style={{ marginTop: 16 }}>
          <ResultView result={result} mode={mode} onUsePrompt={onUsePrompt} showToast={showToast} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Placeholder-Hints pro Mode
// ─────────────────────────────────────────────────────────────
function modeHint(mode) {
  const hints = {
    'tiktok-shop': 'Produkt beschreiben: z.B. "Hochdruckreiniger, reinigt Terrasse in 30 Sek"',
    'fight-action': 'Szene beschreiben: z.B. "Anime-Krieger vs Drachen, Beast-League Stil"',
    'animal-hook': 'Produkt beschreiben: z.B. "Staubsauger, Hund reagiert erschrocken"',
    'cinematic': 'Szene/Stimmung: z.B. "Held steht allein im Regen vor einer brennenden Stadt"',
  }
  return hints[mode] || 'Kurz beschreiben was das Video zeigen soll…'
}

// ─────────────────────────────────────────────────────────────
// Ergebnis-Renderer (passt sich an den Mode an)
// ─────────────────────────────────────────────────────────────
function ResultView({ result, mode, onUsePrompt, showToast }) {
  return (
    <>
      {/* Szenenanalyse */}
      {result.sceneAnalysis && (
        <Section title="📷 Szenenanalyse">
          {typeof result.sceneAnalysis === 'string'
            ? <p className="muted" style={{ margin: 0 }}>{result.sceneAnalysis}</p>
            : <SceneAnalysisObj obj={result.sceneAnalysis} />}
        </Section>
      )}

      {/* Shop-Analyse (tiktok-shop + animal-hook) */}
      {result.shopAnalysis && (
        <Section title="🛒 Shop-Analyse">
          <InfoRow label="Stärkster Vorteil" value={result.shopAnalysis.strongestBenefit} />
          <InfoRow label="Stärkstes Problem" value={result.shopAnalysis.strongestProblem} />
          <InfoRow label="Kaufgrund" value={result.shopAnalysis.strongestBuyReason} />
        </Section>
      )}

      {/* Hooks */}
      {Array.isArray(result.hooks) && result.hooks.length > 0 && (
        <Section title="⚡ Hooks (0–1s)">
          {result.hooks.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13, minWidth: 22 }}>{i + 1}.</span>
              <span className="muted" style={{ fontSize: 13 }}>{h}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Fight: Szenarien */}
      {Array.isArray(result.scenarios) && result.scenarios.length > 0 && (
        <Section title="🥊 Kampfszenarien">
          {result.scenarios.map((s, i) => (
            <div className="variant" key={i}>
              <div className="variant-head">
                <span className="variant-tag">{s.label}</span>
              </div>
              <p className="muted" style={{ margin: '4px 0 2px', fontSize: 13 }}><b>Ablauf:</b> {s.flow}</p>
              <p className="muted" style={{ margin: '2px 0' , fontSize: 13 }}><b>Finisher:</b> {s.finisher}</p>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}><b>Kamera:</b> {s.camera}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Fight: Choreografie */}
      {result.choreography && (
        <Section title="🎭 Choreografie">
          {Object.entries(result.choreography).map(([k, v]) => (
            <InfoRow key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={String(v ?? '')} />
          ))}
        </Section>
      )}

      {/* Varianten (alle Modi) */}
      {Array.isArray(result.variants) && result.variants.length > 0 && (
        <Section title="🎯 Prompt-Varianten">
          {result.variants.map((v, i) => (
            <VariantCard key={i} variant={v} onUsePrompt={onUsePrompt} showToast={showToast} />
          ))}
        </Section>
      )}

      {/* Werbe-Analyse */}
      {result.adAnalysis && (result.adAnalysis.problem || result.adAnalysis.solution || result.adAnalysis.cta) && (
        <Section title="📣 Werbe-Analyse">
          {result.adAnalysis.problem && <InfoRow label="Problem" value={result.adAnalysis.problem} />}
          {result.adAnalysis.solution && <InfoRow label="Lösung" value={result.adAnalysis.solution} />}
          {result.adAnalysis.cta && <InfoRow label="CTA" value={result.adAnalysis.cta} />}
        </Section>
      )}

      {/* Trailer-Info */}
      {result.trailer && (
        <Section title="🎞️ Trailer">
          {result.trailer.hook && <InfoRow label="Hook" value={result.trailer.hook} />}
          {result.trailer.title && <InfoRow label="Titel" value={result.trailer.title} />}
          {result.trailer.tiktokHeadline && <InfoRow label="TikTok-Headline" value={result.trailer.tiktokHeadline} />}
          {Array.isArray(result.trailer.hashtags) && (
            <div style={{ marginTop: 6 }}>
              {result.trailer.hashtags.map((t, i) => (
                <span key={i} className="chip" style={{ marginRight: 4 }}>{t}</span>
              ))}
            </div>
          )}
          {result.trailer.firstComment && (
            <p className="muted" style={{ marginTop: 8, fontSize: 13 }}><b>Erster Kommentar:</b> {result.trailer.firstComment}</p>
          )}
        </Section>
      )}

      {/* Video-Struktur */}
      {Array.isArray(result.structure) && result.structure.length > 0 && (
        <Section title="🕐 Video-Struktur">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.structure.map((s, i) => (
              <span key={i} className="chip"><b>{s.label}:</b> {s.text}</span>
            ))}
          </div>
        </Section>
      )}

      {/* CTAs */}
      {Array.isArray(result.ctas) && result.ctas.length > 0 && (
        <Section title="📲 CTAs">
          {result.ctas.map((c, i) => (
            <div key={i} style={{ marginBottom: 4, fontSize: 13 }} className="muted">→ {c}</div>
          ))}
        </Section>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Sub-Komponenten
// ─────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="card-title" style={{ marginTop: 0, marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <p className="muted" style={{ margin: '0 0 4px', fontSize: 13 }}>
      <b>{label}:</b> {value}
    </p>
  )
}

function SceneAnalysisObj({ obj }) {
  return (
    <>
      {Object.entries(obj).map(([k, v]) => v && (
        <p key={k} className="muted" style={{ margin: '0 0 4px', fontSize: 13 }}>
          <b>{k.charAt(0).toUpperCase() + k.slice(1)}:</b> {String(v ?? '')}
        </p>
      ))}
    </>
  )
}

function VariantCard({ variant, onUsePrompt, showToast }) {
  const prompt = variant.prompt || ''
  const copy = () => {
    navigator.clipboard?.writeText(prompt).then(() => showToast?.('Prompt kopiert', 'success'))
  }
  return (
    <div className="variant">
      <div className="variant-head">
        <div>
          <span className="variant-tag">{variant.label}</span>
          {variant.hookType && (
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-faint)' }}>{variant.hookType}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onUsePrompt && (
            <button className="btn btn-primary btn-sm"
              onClick={() => { onUsePrompt(prompt); showToast?.('Prompt übernommen', 'success') }}>
              ↑ Nutzen
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={copy}>📋</button>
        </div>
      </div>
      {variant.angle && <p className="muted" style={{ margin: '4px 0 2px', fontSize: 12 }}>Winkel: {variant.angle}</p>}
      {variant.concept && <p className="muted" style={{ margin: '2px 0 6px', fontSize: 12 }}>{variant.concept}</p>}
      {prompt && <div className="variant-text" style={{ fontSize: 13 }}>{prompt}</div>}
      {variant.animal && (
        <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>🐾 {variant.animal}</p>
      )}
    </div>
  )
}

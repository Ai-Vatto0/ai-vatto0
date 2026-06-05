import { useApp } from '../store/AppStore'
import { relativeDay } from '../lib/format'
import { HeroArt } from '../components/home/HeroArt'

// ── Inline-SVG-Icons (premium, einheitlich) ──
const I = {
  cloud: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18a4 4 0 0 1-.4-8A6 6 0 0 1 18 9a3.5 3.5 0 0 1 1 6.9" /><path d="M12 12v8M9 15l3-3 3 3" /></svg>,
  spark: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" /><path d="M19 14l.9 2.6L22 17.5l-2.1.9L19 21l-.9-2.6L16 17.5l2.1-.9z" /></svg>,
  play: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>,
  rocket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.8-2.1 0-3s-2.2-.8-3 0Z" /><path d="M9 12c0-4 2.5-8 9-9 .5 6.5-3.5 9-9 9Z" /><path d="M9 12l3 3" /><path d="M14 8.5a1.3 1.3 0 1 0 .01 0Z" fill="currentColor" /></svg>,
}

const STEPS = [
  { ico: I.cloud, t: 'Produkt hochladen', tone: 'cyan' },
  { ico: I.spark, t: 'Ideen generieren', tone: 'pink' },
  { ico: I.play, t: 'Video erstellen', tone: 'pink' },
  { ico: I.rocket, t: 'Auf TikTok posten', tone: 'cyan' },
]

export function HomeScreen({ go, projects }) {
  const recent = (projects || []).filter((p) => p.videoUrl).slice(0, 6)

  return (
    <div className="stack">
      {/* Hero */}
      <section className="hero">
        <HeroArt />
        <div className="hero-body">
          <span className="hero-eyebrow">★ PREMIUM CREATOR STUDIO</span>
          <h1>TikTok Shop Videos, die <span className="grad-pink">verkaufen.</span></h1>
          <p>Lade dein Produkt hoch und erhalte verkaufsfertige Videoideen, Hooks und Prompts — in Sekunden.</p>
          <button className="btn btn-primary hero-cta" onClick={() => go('generator')}>
            <span className="cta-ico">{I.cloud}</span> Produkt hochladen
          </button>
        </div>
      </section>

      {/* So funktioniert's */}
      <div>
        <p className="eyebrow" style={{ margin: '0 2px 14px' }}>So funktioniert's</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step-mini" key={i}>
              <div className={`bub ${s.tone}`}>{s.ico}</div>
              <span className="t"><b>{i + 1}.</b> {s.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Letzte Videos */}
      {recent.length > 0 && (
        <div>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <p className="eyebrow" style={{ margin: 0 }}>Deine letzten Videos</p>
            <button className="link" onClick={() => go('videos')}>Alle anzeigen</button>
          </div>
          <div className="hscroll">
            {recent.map((p) => (
              <div key={p.id} className="hcard" onClick={() => go('videos')}>
                <div className="vthumb-wrap">
                  <video className="vthumb" src={p.videoUrl} muted playsInline preload="metadata" style={{ width: 124, height: 165 }} />
                  {p.duration && <span className="vthumb-dur">00:{String(p.duration).padStart(2, '0')}</span>}
                </div>
                <div className="vmeta" style={{ marginTop: 6 }}>
                  <div className="vt" style={{ fontSize: 12, WebkitLineClamp: 1 }}>{p.title || p.prompt || 'Video'}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{relativeDay(p.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade-Promo */}
      <div className="promo" onClick={() => go('tox')}>
        <span className="promo-crown">👑</span>
        <div style={{ flex: 1 }}>
          <div className="pt">Mehr TOX, mehr Videos, mehr Umsatz.</div>
          <div className="ps">Hol dir dein TOX-Paket und erstelle noch mehr virale Videos.</div>
        </div>
        <span className="promo-arrow">›</span>
      </div>
    </div>
  )
}

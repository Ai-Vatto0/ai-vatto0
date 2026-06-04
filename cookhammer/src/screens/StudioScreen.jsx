import { GeneratorPanel } from '../components/generator/GeneratorPanel'

// ─────────────────────────────────────────────────────────────
// PRIVATES STUDIO (nur für dich, versteckt entsperrbar).
// Volle Cookhammer-Engine: alle 4 Modi, Dauer 6–15s, Roh-Prompt,
// KEIN TOX-Limit. Nicht Teil des öffentlichen Produkts.
// ─────────────────────────────────────────────────────────────
export function StudioScreen({ showToast, go, addProject }) {
  return (
    <div className="stack">
      <div className="spread">
        <div className="row" style={{ gap: 10 }}>
          <span className="studio-tag">🛠️ STUDIO · PRIVAT</span>
        </div>
        <button className="link" onClick={() => go('profil')}>Schließen</button>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Dein privater Bereich für ALLE Video-Typen — TikTok Shop, Action/Anime, Cinematic, Meme & Co.
        Eigener Prompt (bis 2500 Zeichen), freie Länge (6–15s), alle Formate, ohne TOX-Limit. Nur für dich sichtbar.
      </p>

      <GeneratorPanel onComplete={addProject} showToast={showToast} />
    </div>
  )
}

import { useApp, formatTox } from '../../store/AppStore'

// Premium Top-Bar: Brand links, TOX-Guthaben-Pille rechts (→ TOX-Tab).
export function TopBar() {
  const { tox, setTab } = useApp()
  return (
    <header className="topbar">
      <div className="brand" onClick={() => setTab('home')} style={{ cursor: 'pointer' }}>
        <img src="/icon.svg" alt="" />
        <span className="name">TokTok <span className="shop">Shop</span></span>
      </div>
      <button className="tox-pill" onClick={() => setTab('tox')} aria-label="TOX-Guthaben">
        <span className="k">TOX</span> {formatTox(tox)}
        <span className="plus">+</span>
      </button>
    </header>
  )
}

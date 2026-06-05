import { useApp } from '../../store/AppStore'

// 5-Tab Bottom-Navigation. Aktiver Tab in Neon-Pink.
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  generator: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
  videos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  tox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M9 9h6M12 9v7M9.5 16h5" />
    </svg>
  ),
  profil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
}

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'generator', label: 'Generator' },
  { id: 'videos', label: 'Videos' },
  { id: 'tox', label: 'TOX' },
  { id: 'profil', label: 'Profil' },
]

export function BottomNav() {
  const { tab, setTab } = useApp()
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-item ${tab === t.id ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span className="ico">{ICONS[t.id]}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

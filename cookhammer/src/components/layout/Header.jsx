export function Header() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 16px', borderBottom: '1px solid var(--border)',
    }}>
      <img src="/icon.svg" alt="" width={28} height={28} />
      <strong style={{ fontSize: 18, letterSpacing: 0.5 }}>Cookhammer</strong>
      <span className="muted" style={{ marginLeft: 'auto' }}>Grok 1.5</span>
    </header>
  )
}

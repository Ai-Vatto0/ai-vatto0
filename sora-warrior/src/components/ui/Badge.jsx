export function Badge({ children, color = 'gold', style }) {
  const colors = {
    gold: { background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' },
    green: { background: 'rgba(0,255,0,0.1)', color: '#00ff00', border: '1px solid rgba(0,255,0,0.3)' },
    orange: { background: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' },
    red: { background: 'rgba(255,51,51,0.1)', color: '#ff3333', border: '1px solid rgba(255,51,51,0.3)' },
    white: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' },
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 'bold',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontFamily: 'Arial, sans-serif',
      ...colors[color],
      ...style,
    }}>
      {children}
    </span>
  )
}

export function Button({ children, variant = 'primary', onClick, disabled, style, fullWidth }) {
  const base = {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '13px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 100ms ease',
    outline: 'none',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #ff6b35, #cc4400)',
      color: '#fff',
      border: '1px solid rgba(255,107,53,0.6)',
      boxShadow: disabled ? 'none' : '0 0 12px rgba(255,107,53,0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #cc0000, #880000)',
      color: '#fff',
      border: '1px solid rgba(204,0,0,0.6)',
      boxShadow: disabled ? 'none' : '0 0 12px rgba(204,0,0,0.3)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.8)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    },
    gold: {
      background: 'linear-gradient(135deg, #d4af37, #9a7c1c)',
      color: '#000',
      border: '1px solid rgba(212,175,55,0.6)',
      boxShadow: disabled ? 'none' : '0 0 12px rgba(212,175,55,0.3)',
    },
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}

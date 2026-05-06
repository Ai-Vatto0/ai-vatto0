import { useEffect } from 'react'

export function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null

  const colors = {
    info:    { bg: 'rgba(13,17,48,0.97)', border: 'rgba(212,175,55,0.4)', color: '#d4af37' },
    success: { bg: 'rgba(0,30,0,0.97)',   border: 'rgba(0,255,0,0.4)',    color: '#00ff00' },
    error:   { bg: 'rgba(30,0,0,0.97)',   border: 'rgba(255,51,51,0.4)', color: '#ff3333' },
    warning: { bg: 'rgba(30,20,0,0.97)',  border: 'rgba(255,170,0,0.4)', color: '#ffaa00' },
  }

  const c = colors[type] ?? colors.info

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      padding: '12px 20px',
      borderRadius: '4px',
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      letterSpacing: '0.5px',
      maxWidth: '340px',
      textAlign: 'center',
      boxShadow: `0 4px 20px rgba(0,0,0,0.6)`,
      animation: 'slideIn 150ms ease',
      cursor: 'pointer',
    }} onClick={onClose}>
      {message}
    </div>
  )
}

import { Badge } from '../ui/Badge'
import { CREDITS_PER_VIDEO } from '../../types/index'

export function Header({ credits, isVip, loading }) {
  return (
    <header style={{
      background: 'rgba(5,8,18,0.95)',
      borderBottom: '2px solid rgba(212,175,55,0.3)',
      padding: '0 16px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: '20px',
          letterSpacing: '3px',
          color: '#ff6b35',
          textShadow: '0 0 20px rgba(255,107,53,0.6)',
          textTransform: 'uppercase',
        }}>
          SORA
        </span>
        <span style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: '20px',
          letterSpacing: '3px',
          color: '#d4af37',
          textShadow: '0 0 15px rgba(212,175,55,0.5)',
          textTransform: 'uppercase',
        }}>
          WARRIOR
        </span>
        {isVip && (
          <Badge color="gold" style={{ fontSize: '9px', padding: '2px 6px' }}>VIP</Badge>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading ? (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>...</span>
        ) : credits !== null ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '4px',
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span style={{
              fontFamily: 'Impact, sans-serif',
              fontSize: '15px',
              color: '#d4af37',
              letterSpacing: '1px',
            }}>
              {credits.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
              CR
            </span>
          </div>
        ) : null}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.5px',
        }}>
          {CREDITS_PER_VIDEO} / VIDEO
        </div>
      </div>
    </header>
  )
}

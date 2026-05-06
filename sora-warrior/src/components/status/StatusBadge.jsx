import { STATUS } from '../../types/index'

const STATUS_CONFIG = {
  [STATUS.IDLE]:      { label: 'READY',      color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', dot: '#ffffff44' },
  [STATUS.PENDING]:   { label: 'PENDING',    color: '#ffaa00', bg: 'rgba(255,170,0,0.08)', dot: '#ffaa00' },
  [STATUS.RUNNING]:   { label: 'GENERATING', color: '#ffaa00', bg: 'rgba(255,170,0,0.08)', dot: '#ffaa00', pulse: true },
  [STATUS.SUCCEEDED]: { label: 'DONE',       color: '#00ff00', bg: 'rgba(0,255,0,0.08)',   dot: '#00ff00' },
  [STATUS.FAILED]:    { label: 'FAILED',     color: '#ff3333', bg: 'rgba(255,51,51,0.08)', dot: '#ff3333' },
}

export function StatusBadge({ status, progress }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[STATUS.IDLE]

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: cfg.bg,
      border: `1px solid ${cfg.color}44`,
      borderRadius: '4px',
      padding: '5px 10px',
    }}>
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: cfg.dot,
        display: 'inline-block',
        animation: cfg.pulse ? 'pulse-gold 1s ease infinite' : undefined,
        boxShadow: cfg.pulse ? `0 0 6px ${cfg.dot}` : undefined,
      }} />
      <span style={{
        fontFamily: 'Impact, sans-serif',
        fontSize: '12px',
        letterSpacing: '2px',
        color: cfg.color,
      }}>
        {cfg.label}
        {status === STATUS.RUNNING && progress > 0 ? ` ${progress}%` : ''}
      </span>
    </div>
  )
}

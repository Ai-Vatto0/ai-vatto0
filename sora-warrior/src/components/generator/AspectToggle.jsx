import { ASPECT_RATIOS } from '../../types/index'

export function AspectToggle({ value, onChange }) {
  const options = [
    { value: ASPECT_RATIOS.PORTRAIT,  label: '9:16', icon: '📱', sub: 'Portrait' },
    { value: ASPECT_RATIOS.LANDSCAPE, label: '16:9', icon: '🖥', sub: 'Landscape' },
  ]

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: active ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? 'rgba(255,107,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '4px',
              color: active ? '#ff6b35' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 100ms ease',
              boxShadow: active ? '0 0 10px rgba(255,107,53,0.2)' : 'none',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>{opt.icon}</div>
            <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '13px', letterSpacing: '1px' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.5px', marginTop: '1px' }}>
              {opt.sub}
            </div>
          </button>
        )
      })}
    </div>
  )
}

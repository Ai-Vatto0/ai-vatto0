import { useState } from 'react'

export function PromptHistory({ prompts, onSelect, onDelete }) {
  const [copied, setCopied] = useState(null)

  if (!prompts.length) return null

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
    onSelect(text)
  }

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '8px' }}>
        Prompt History ({prompts.length}/20)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
        {prompts.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '4px',
              padding: '6px 8px',
            }}
          >
            <span
              onClick={() => handleCopy(p.text, p.id)}
              style={{
                flex: 1,
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.4,
              }}
            >
              {p.text}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', minWidth: '20px', textAlign: 'right' }}>
              ×{p.usedCount}
            </span>
            <button
              onClick={() => handleCopy(p.text, p.id)}
              style={{
                background: copied === p.id ? 'rgba(0,255,0,0.1)' : 'rgba(212,175,55,0.08)',
                border: `1px solid ${copied === p.id ? 'rgba(0,255,0,0.3)' : 'rgba(212,175,55,0.2)'}`,
                borderRadius: '4px',
                color: copied === p.id ? '#00ff00' : '#d4af37',
                padding: '3px 7px',
                cursor: 'pointer',
                fontSize: '10px',
                letterSpacing: '0.5px',
                fontWeight: 'bold',
                minWidth: '42px',
                textAlign: 'center',
              }}
            >
              {copied === p.id ? '✓' : 'USE'}
            </button>
            <button
              onClick={() => onDelete(p.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const MAX_CHARS = 3500

export function PromptInput({ value, onChange }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Describe your anime scene... dark warrior, lightning, epic battle..."
        rows={8}
        style={{
          width: '100%',
          background: '#050812',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          padding: '10px 12px',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.5,
          transition: 'border-color 100ms ease',
          minHeight: '180px',
        }}
        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      <div style={{
        textAlign: 'right',
        fontSize: '11px',
        color: value.length > MAX_CHARS * 0.9 ? '#ffaa00' : 'rgba(255,255,255,0.25)',
        marginTop: '4px',
        letterSpacing: '0.5px',
      }}>
        {value.length}/{MAX_CHARS}
      </div>
    </div>
  )
}

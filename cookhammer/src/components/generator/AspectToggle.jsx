const RATIOS = [
  { id: '9:16', label: '9:16 ↕' },  // TikTok / Hochformat
  { id: '1:1', label: '1:1 ◻' },
  { id: '16:9', label: '16:9 ↔' },
]

export function AspectToggle({ value, onChange, disabled }) {
  return (
    <div>
      <label className="label">Format</label>
      <div className="seg">
        {RATIOS.map((r) => (
          <button key={r.id} type="button" disabled={disabled}
            className={`seg-btn ${value === r.id ? 'active' : ''}`}
            onClick={() => onChange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

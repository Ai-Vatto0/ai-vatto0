const DURATIONS = [6, 8, 10, 12, 15]

export function DurationToggle({ value, onChange, disabled }) {
  return (
    <div>
      <label className="label">Dauer</label>
      <div className="seg">
        {DURATIONS.map((d) => (
          <button key={d} type="button" disabled={disabled}
            className={`seg-btn ${value === d ? 'active' : ''}`}
            onClick={() => onChange(d)}>
            {d}s
          </button>
        ))}
      </div>
    </div>
  )
}

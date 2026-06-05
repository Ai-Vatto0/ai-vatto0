const PROMPT_MAX = 2500   // Grok-Maximum

export function PromptInput({ value, onChange, disabled }) {
  return (
    <div>
      <label className="label">Prompt</label>
      <textarea
        className="textarea"
        placeholder="Beschreibe das Video … oder nutze den KI-Assistenten unten."
        value={value}
        disabled={disabled}
        maxLength={PROMPT_MAX}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="faint" style={{ fontSize: 11, textAlign: 'right' }}>{(value || '').length}/{PROMPT_MAX}</div>
    </div>
  )
}

// 4-Schritt-Fortschritt: Produkt · Ideen · Video · Fertig
const STEPS = ['Produkt', 'Ideen', 'Video', 'Fertig']

export function Stepper({ current = 1 }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'active' : ''
        return (
          <Step key={label} n={n} label={label} state={state} showLine={i > 0} lineDone={n <= current} />
        )
      })}
    </div>
  )
}

function Step({ n, label, state, showLine, lineDone }) {
  return (
    <>
      {showLine && <div className={`seg-line ${lineDone ? 'done' : ''}`} />}
      <div className={`step ${state}`}>
        <div className="num">{state === 'done' ? '✓' : n}</div>
        <span className="lbl">{label}</span>
      </div>
    </>
  )
}

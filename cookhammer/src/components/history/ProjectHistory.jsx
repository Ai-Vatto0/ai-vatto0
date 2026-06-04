// Historie aller Generierungen (lokal gespeichert).
export function ProjectHistory({ projects, onRemove }) {
  if (!projects.length) {
    return (
      <div className="empty">
        <div style={{ fontSize: 44, marginBottom: 8 }}>🎬</div>
        <div>Noch keine Videos.</div>
        <div className="muted">Generierte Videos erscheinen hier.</div>
      </div>
    )
  }
  return (
    <div className="stack">
      {projects.map((p) => (
        <div className="card stack" key={p.id} style={{ gap: 10 }}>
          {p.videoUrl
            ? <video className="video" src={p.videoUrl} controls playsInline />
            : <div className="muted">Kein Video (Task: {p.taskId})</div>}
          {p.prompt && <p className="muted" style={{ margin: 0 }}>{p.prompt}</p>}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted" style={{ fontSize: 11 }}>
              {new Date(p.createdAt).toLocaleString('de-DE')} · {p.aspectRatio} · {p.duration}s
            </span>
            <div className="row" style={{ gap: 8 }}>
              {p.videoUrl && (
                <a className="btn btn-ghost btn-sm" href={p.videoUrl} download target="_blank" rel="noreferrer"
                   style={{ textDecoration: 'none' }}>⬇</a>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => onRemove(p.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

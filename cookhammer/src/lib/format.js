// Kleine Formatierungs-Helfer.

// ISO-Datum → "Heute" / "Gestern" / "vor X Tagen" / Datum
export function relativeDay(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000)
  if (diffDays <= 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// 8 → "00:08"
export function durationLabel(sec) {
  const s = Number(sec) || 0
  return `00:${String(s).padStart(2, '0')}`
}

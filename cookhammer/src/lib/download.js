// ─────────────────────────────────────────────────────────────
// Video speichern — iPhone-tauglich.
// iOS Safari ignoriert <a download> und öffnet das Video nur. Der
// zuverlässige Weg in die Fotos-App ist die Web-Share-API mit einer
// echten Datei: navigator.share({ files:[File] }) → „Video sichern".
// Fallback (Desktop/Android): klassischer Blob-Download.
// ─────────────────────────────────────────────────────────────

function safeName(name) {
  const base = (name || 'toktok-video').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '')
  return `${base || 'toktok-video'}.mp4`
}

/**
 * Lädt das Video als Blob und versucht es in die Galerie zu speichern.
 * @param {string} url        - Video-URL
 * @param {string} [title]    - Dateiname/Teilen-Titel
 * @returns {Promise<'shared'|'downloaded'>}
 */
function clickLink(href, { download, blank } = {}) {
  const a = document.createElement('a')
  a.href = href
  if (download) a.download = download
  if (blank) { a.target = '_blank'; a.rel = 'noreferrer' }
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * @returns {Promise<'shared'|'downloaded'|'opened'>}
 *  shared    = iOS Share-Sheet („Video sichern")
 *  downloaded= klassischer Blob-Download
 *  opened    = CORS/Netz-Fehler → Video nur geöffnet (Nutzer sichert manuell)
 */
export async function saveVideo(url, title) {
  const filename = safeName(title)

  // 1) Blob versuchen (nötig für Share UND sauberen Download). Bei CORS/Netz-Fehler null.
  let blob = null
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (res.ok) blob = await res.blob()
  } catch { /* CORS/Netz → Fallback unten */ }

  if (blob) {
    const file = new File([blob], filename, { type: blob.type || 'video/mp4' })
    // iOS / mobile: Web-Share-API → „In Fotos sichern"
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: title || 'TokTok Shop Video' })
        return 'shared'
      } catch (err) {
        if (err?.name === 'AbortError') return 'shared'   // Nutzer-Abbruch, kein Fehler
        // sonst auf Download zurückfallen
      }
    }
    const objectUrl = URL.createObjectURL(blob)
    clickLink(objectUrl, { download: filename })
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)
    return 'downloaded'
  }

  // 2) Ohne Blob (CDN ohne CORS): Video direkt öffnen/laden — Nutzer sichert manuell.
  clickLink(url, { download: filename, blank: true })
  return 'opened'
}

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
export async function saveVideo(url, title) {
  const filename = safeName(title)

  // 1) Blob holen (gleiche Datei für Share UND Download)
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`Video konnte nicht geladen werden (${res.status})`)
  const blob = await res.blob()
  const file = new File([blob], filename, { type: blob.type || 'video/mp4' })

  // 2) iOS / mobile: Web-Share-API → „In Fotos sichern"
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: title || 'TokTok Shop Video' })
      return 'shared'
    } catch (err) {
      // Nutzer hat abgebrochen → nicht als Fehler werten
      if (err?.name === 'AbortError') return 'shared'
      // sonst auf Download zurückfallen
    }
  }

  // 3) Fallback: klassischer Download (Desktop/Android)
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000)
  return 'downloaded'
}

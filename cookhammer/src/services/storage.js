// ─────────────────────────────────────────────────────────────
// Bild-Upload nach Supabase Storage → öffentliche URL.
// Grok/kie.ai erwartet eine image_url (kein base64), deshalb muss
// das Bild zuerst hochgeladen werden.
//
// Voraussetzung im Supabase-Projekt:
//   - Bucket `cookhammer-uploads` existiert und ist "public" (read).
//   - Eine Storage-Policy erlaubt INSERT für anon (oder Bucket public write).
//     Da die App nur für dich ist, ist das vertretbar.
// ─────────────────────────────────────────────────────────────
import { CONFIG, supaHeaders } from '../config'

// Wandelt ein File in einen sicheren, eindeutigen Dateinamen um.
function buildPath(file) {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `uploads/${id}.${ext}`
}

/**
 * Lädt eine Bilddatei hoch und gibt die öffentliche URL zurück.
 * @param {File|Blob} file
 * @returns {Promise<string>} public image URL
 */
export async function uploadImage(file) {
  const path = buildPath(file)
  const url = `${CONFIG.supabaseUrl}/storage/v1/object/${CONFIG.bucket}/${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: supaHeaders({
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'true',
    }),
    body: file,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload fehlgeschlagen (${res.status}): ${text || res.statusText}`)
  }

  // Öffentliche URL (Bucket muss public sein)
  return `${CONFIG.supabaseUrl}/storage/v1/object/public/${CONFIG.bucket}/${path}`
}

/**
 * Lädt mehrere Bilddateien parallel hoch und gibt die öffentlichen URLs zurück
 * (gleiche Reihenfolge wie die Eingabe). Bild 0 = Hauptbild/Referenz.
 * @param {Array<File|Blob>} files
 * @returns {Promise<string[]>}
 */
export async function uploadMany(files) {
  return Promise.all((files || []).map((f) => uploadImage(f)))
}

// Hilfsfunktion: DataURL/base64 → File (falls Bild aus Canvas/Clipboard kommt)
export function dataUrlToFile(dataUrl, filename = 'image.jpg') {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new File([arr], filename, { type: mime })
}

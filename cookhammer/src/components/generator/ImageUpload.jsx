import { useRef } from 'react'

// Bis zu 4 Bilder. Slot 0 = Hauptbild (an Grok gesendet).
// Bild 2–4 sind nur Referenz/Verwaltung (API nimmt aktuell max. 1).
const MAX = 4

export function ImageUpload({ images, onAdd, onRemove, disabled }) {
  const inputRef = useRef(null)

  const pick = () => inputRef.current?.click()
  const onFile = (e) => {
    const files = Array.from(e.target.files || [])
    files.slice(0, MAX - images.length).forEach(onAdd)
    e.target.value = '' // erlaubt erneutes Wählen derselben Datei
  }

  return (
    <div>
      <label className="label">Bilder ({images.length}/{MAX}) · Bild 1 = Hauptbild</label>
      <div className="img-grid">
        {images.map((img, i) => (
          <div key={img.url} className={`img-slot ${i === 0 ? 'main' : ''}`}>
            <img src={img.url} alt={`Bild ${i + 1}`} />
            {i === 0 && <span className="img-badge">MAIN</span>}
            {!disabled && (
              <button type="button" className="img-remove" onClick={() => onRemove(i)} aria-label="Entfernen">×</button>
            )}
          </div>
        ))}
        {images.length < MAX && !disabled && (
          <div className="img-slot" onClick={pick}>＋</div>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple
        style={{ display: 'none' }} onChange={onFile}
      />
    </div>
  )
}

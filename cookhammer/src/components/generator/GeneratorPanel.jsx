import { useState, useCallback } from 'react'
import { ImageUpload } from './ImageUpload'
import { PromptInput } from './PromptInput'
import { AspectToggle } from './AspectToggle'
import { DurationToggle } from './DurationToggle'
import { PromptAssistant } from '../assistant/PromptAssistant'
import { StatusBadge } from '../status/StatusBadge'
import { useGenerate, STATUS } from '../../hooks/useGenerate'
import { VideoResult } from '../showcase/VideoResult'

export function GeneratorPanel({ onComplete, showToast }) {
  const [images, setImages] = useState([])      // [{ file, url, uploadedUrl? }]
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [duration, setDuration] = useState(10)

  const gen = useGenerate({
    onSuccess: ({ videoUrl, task }) => {
      onComplete?.({ ...task, videoUrl })
      showToast?.('Video fertig! 🎬', 'success')
    },
  })

  const addImage = useCallback((file) => {
    setImages((prev) => [...prev, { file, url: URL.createObjectURL(file) }])
  }, [])
  const removeImage = useCallback((i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }, [])
  // Assistent hat das Hauptbild schon hochgeladen → URL merken, spart 2. Upload
  const setMainUploaded = useCallback((url) => {
    setImages((prev) => prev.map((img, i) => (i === 0 ? { ...img, uploadedUrl: url } : img)))
  }, [])

  const mainImage = images[0] || null

  const handleGenerate = () => {
    if (!mainImage) return showToast?.('Bitte ein Bild hochladen', 'error')
    if (!prompt.trim()) return showToast?.('Bitte einen Prompt eingeben', 'error')
    gen.generate({
      file: mainImage.file,
      imageUrl: mainImage.uploadedUrl, // ggf. bereits hochgeladen
      prompt: prompt.trim(),
      aspectRatio,
      duration,
    })
  }

  return (
    <div className="stack">
      <div className="card stack">
        <p className="card-title" style={{ margin: 0 }}>🎬 Video Generator</p>

        <ImageUpload images={images} onAdd={addImage} onRemove={removeImage} disabled={gen.isBusy} />
        <PromptInput value={prompt} onChange={setPrompt} disabled={gen.isBusy} />
        <AspectToggle value={aspectRatio} onChange={setAspectRatio} disabled={gen.isBusy} />
        <DurationToggle value={duration} onChange={setDuration} disabled={gen.isBusy} />

        <button className="btn btn-primary" onClick={handleGenerate} disabled={gen.isBusy}>
          {gen.isBusy ? <><i className="spin" /> Läuft…</> : '⚡ Video generieren'}
        </button>

        {(gen.status !== STATUS.IDLE) && (
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <StatusBadge status={gen.status} />
              {gen.taskId && <span className="muted" style={{ fontSize: 11 }}>ID: {gen.taskId.slice(0, 12)}…</span>}
            </div>
            {gen.isBusy && (
              <div className="progress"><i style={{ width: `${gen.progress || 8}%` }} /></div>
            )}
            {gen.error && <div className="banner">{gen.error}</div>}
            {gen.status === STATUS.FAILED && (
              <button className="btn btn-ghost" onClick={gen.reset}>Zurücksetzen</button>
            )}
          </div>
        )}

        {gen.videoUrl && (
          <VideoResult videoUrl={gen.videoUrl} prompt={prompt} onNew={gen.reset} showToast={showToast} />
        )}
      </div>

      {mainImage && (
        <PromptAssistant
          mainImage={mainImage}
          aspectRatio={aspectRatio}
          duration={duration}
          onUsePrompt={(p) => { setPrompt(p); showToast?.('Prompt übernommen', 'info') }}
          onUploaded={setMainUploaded}
          showToast={showToast}
        />
      )}
    </div>
  )
}

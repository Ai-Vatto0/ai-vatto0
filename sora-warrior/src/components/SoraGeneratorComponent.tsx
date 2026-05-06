/**
 * SoraGeneratorComponent
 * Text-to-Video Generator mit Dark Warrior Design
 */

import { useState } from 'react'
import { generateSoraTextToVideo } from '../services/soraService'

const CREDITS_PER_VIDEO = 150

// Dark Warrior Farben
const C = {
  bg:       '#0a0e27',
  bgCard:   '#0d1230',
  border:   '#1a2040',
  gold:     '#d4af37',
  orange:   '#ff6b35',
  red:      '#cc0000',
  cyan:     '#00c8ff',
  text:     '#e8eaf6',
  textDim:  '#8892b0',
  success:  '#39ff14',
  error:    '#ff3333',
} as const

export function SoraGeneratorComponent() {
  const [prompt, setPrompt]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus]     = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError]       = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Bitte gib einen Prompt ein!')
      return
    }

    setLoading(true)
    setError('')
    setVideoUrl('')
    setProgress(0)
    setStatus('Starte Generierung…')

    try {
      const result = await generateSoraTextToVideo(
        prompt,
        (s, p) => {
          setStatus(s)
          setProgress(p)
        }
      )

      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl)
        setStatus('Fertig!')
        setProgress(100)
      } else {
        const msg = result.error ?? 'Unbekannter Fehler'
        // Credits-Fehler besonders hervorheben
        setError(msg.includes('Credits') ? `Nicht genug Credits (${CREDITS_PER_VIDEO} benötigt)` : msg)
        setStatus('')
      }
    } catch (err) {
      setError(String(err))
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '24px',
      background: C.bg,
      borderRadius: '8px',
      border: `1px solid ${C.border}`,
      fontFamily: 'Arial, sans-serif',
      color: C.text,
      maxWidth: '600px',
    }}>
      <h2 style={{
        fontFamily: 'Impact, Arial, sans-serif',
        color: C.gold,
        letterSpacing: '2px',
        fontSize: '20px',
        margin: '0 0 8px',
        textTransform: 'uppercase',
      }}>
        Video generieren
      </h2>

      {/* Credits-Hinweis */}
      <p style={{ fontSize: '12px', color: C.textDim, margin: '0 0 16px' }}>
        Kostet {CREDITS_PER_VIDEO} Credits pro Video
      </p>

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Beschreibe dein Video… (z.B. 'A dark warrior fighting in the rain')"
        disabled={loading}
        style={{
          width: '100%',
          height: '100px',
          padding: '12px',
          fontSize: '14px',
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: '4px',
          color: C.text,
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: '12px',
          outline: 'none',
        }}
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '12px 28px',
          fontSize: '14px',
          fontFamily: 'Impact, Arial, sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          background: loading ? '#333' : `linear-gradient(135deg, ${C.orange}, ${C.red})`,
          color: loading ? C.textDim : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'Generiere…' : 'Video generieren'}
      </button>

      {/* Progress */}
      {loading && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: C.textDim, margin: '0 0 8px' }}>
            {status}
          </p>
          <div style={{
            width: '100%',
            height: '6px',
            background: C.border,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${C.cyan}, ${C.gold})`,
              transition: 'width 0.4s ease',
              borderRadius: '3px',
            }} />
          </div>
          <p style={{ fontSize: '11px', color: C.textDim, margin: '6px 0 0', textAlign: 'right' }}>
            {progress}%
          </p>
        </div>
      )}

      {/* Fehler */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(204,0,0,0.15)',
          border: `1px solid ${C.red}`,
          borderRadius: '4px',
          color: C.error,
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Ergebnis */}
      {videoUrl && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ color: C.success, fontSize: '13px', marginBottom: '10px' }}>
            Video bereit!
          </p>
          <video
            src={videoUrl}
            controls
            style={{
              width: '100%',
              borderRadius: '4px',
              border: `1px solid ${C.border}`,
              background: '#000',
            }}
          />
          <a
            href={videoUrl}
            download
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '10px 20px',
              background: C.gold,
              color: '#000',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'Impact, Arial, sans-serif',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Download
          </a>
        </div>
      )}
    </div>
  )
}

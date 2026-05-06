import { useState } from 'react'
import { ImageUpload } from './ImageUpload'
import { AspectToggle } from './AspectToggle'
import { PromptInput } from './PromptInput'
import { GenerateButton } from './GenerateButton'
import { StatusBadge } from '../status/StatusBadge'
import { ASPECT_RATIOS, STATUS } from '../../types/index'

export function GeneratorPanel({ onGenerate, generateState, credits, onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageId, setSelectedImageId] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS.PORTRAIT)
  const [prompt, setPrompt] = useState('')

  const { status, progress, error, currentVideo, reset } = generateState

  const handleImageSelected = (base64, imageId = null) => {
    setSelectedImage(base64)
    setSelectedImageId(imageId)
    onImageSelect?.(base64, imageId)
  }

  const handleGenerate = () => {
    onGenerate({ imageData: selectedImage, prompt, aspectRatio })
  }

  const handleReset = () => {
    reset()
    setSelectedImage(null)
    setSelectedImageId(null)
    setPrompt('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Image Upload */}
      <div>
        <div className="section-label">Reference Image</div>
        <ImageUpload selectedImage={selectedImage} onImageSelected={handleImageSelected} />
      </div>

      {/* Aspect Ratio */}
      <div>
        <div className="section-label">Format</div>
        <AspectToggle value={aspectRatio} onChange={setAspectRatio} />
      </div>

      {/* Prompt */}
      <div>
        <div className="section-label">Prompt</div>
        <PromptInput value={prompt} onChange={setPrompt} />
      </div>

      {/* Status */}
      {status !== STATUS.IDLE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusBadge status={status} progress={progress} />
          {(status === STATUS.SUCCEEDED || status === STATUS.FAILED) && (
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.5)',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '1px',
              }}
            >
              RESET
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,51,51,0.08)',
          border: '1px solid rgba(255,51,51,0.3)',
          borderRadius: '4px',
          padding: '10px',
          color: '#ff3333',
          fontSize: '12px',
        }}>
          {error}
        </div>
      )}

      {/* Video Result */}
      {currentVideo && status === STATUS.SUCCEEDED && (
        <div style={{
          background: 'rgba(0,255,0,0.05)',
          border: '1px solid rgba(0,255,0,0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <video
            src={currentVideo}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', display: 'block' }}
          />
          <div style={{ padding: '10px', display: 'flex', gap: '8px' }}>
            <a
              href={currentVideo}
              download="sora-warrior-video.mp4"
              style={{
                flex: 1,
                display: 'block',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #00aa00, #006600)',
                color: '#fff',
                padding: '10px',
                borderRadius: '4px',
                fontFamily: 'Impact, sans-serif',
                fontSize: '13px',
                letterSpacing: '2px',
                textDecoration: 'none',
                border: '1px solid rgba(0,255,0,0.3)',
                boxShadow: '0 0 10px rgba(0,255,0,0.2)',
              }}
            >
              ⬇ DOWNLOAD
            </a>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {status !== STATUS.SUCCEEDED && (
        <GenerateButton
          onClick={handleGenerate}
          status={status}
          credits={credits}
          hasImage={!!selectedImage}
          hasPrompt={!!prompt.trim()}
        />
      )}
    </div>
  )
}

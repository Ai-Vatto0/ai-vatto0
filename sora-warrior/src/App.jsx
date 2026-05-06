import { useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { GeneratorPanel } from './components/generator/GeneratorPanel'
import { ImageGallery } from './components/gallery/ImageGallery'
import { PromptHistory } from './components/history/PromptHistory'
import { VideoShowcase } from './components/showcase/VideoShowcase'
import { Toast } from './components/ui/Toast'
import { useCredits } from './hooks/useCredits'
import { useImages } from './hooks/useImages'
import { usePrompts } from './hooks/usePrompts'
import { useVideos } from './hooks/useVideos'
import { useGenerate } from './hooks/useGenerate'

export default function App() {
  const { credits, isVip, loading: creditsLoading, refresh: refreshCredits } = useCredits()
  const { images, addImage, markUsed } = useImages()
  const { prompts, addPrompt, removePrompt } = usePrompts()
  const { videos, addVideo, removeVideo } = useVideos()
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('generator') // 'generator' | 'showcase'

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  const generateState = useGenerate({
    onSuccess: ({ videoUrl }) => {
      addVideo({
        imageId: null,
        prompt: generateState._lastPrompt,
        aspectRatio: generateState._lastAspectRatio,
        videoUrl,
        status: 'succeeded',
      })
      showToast('Video generated!', 'success')
    },
    onCreditsRefresh: refreshCredits,
  })

  // Store last params in generate state for onSuccess callback
  const handleGenerate = useCallback(({ imageData, prompt, aspectRatio }) => {
    generateState._lastPrompt = prompt
    generateState._lastAspectRatio = aspectRatio
    addPrompt(prompt)
    generateState.generate({ imageData, prompt, aspectRatio })
  }, [generateState, addPrompt])

  const handleImageSelect = useCallback((base64, imageId) => {
    if (!imageId) {
      addImage(base64)
    } else {
      markUsed(imageId)
    }
  }, [addImage, markUsed])

  const handlePromptSelect = useCallback((text) => {
    showToast('Prompt copied to clipboard', 'info')
  }, [showToast])

  const tabs = [
    { id: 'generator', label: '⚡ GENERATOR' },
    { id: 'showcase',  label: `🎬 VIDEOS (${videos.length})` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header credits={credits} isVip={isVip} loading={creditsLoading} />

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        background: 'rgba(5,8,18,0.5)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#ff6b35' : 'transparent'}`,
              color: activeTab === tab.id ? '#ff6b35' : 'rgba(255,255,255,0.4)',
              fontFamily: 'Impact, sans-serif',
              fontSize: '12px',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              transition: 'all 100ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '16px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>

        {activeTab === 'generator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Generator */}
            <div className="card">
              <GeneratorPanel
                onGenerate={handleGenerate}
                generateState={generateState}
                credits={credits}
                onImageSelect={handleImageSelect}
              />
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="card">
                <ImageGallery
                  images={images}
                  onSelect={(base64, id) => {
                    markUsed(id)
                    showToast('Image selected', 'info')
                  }}
                />
              </div>
            )}

            {/* Prompt History */}
            {prompts.length > 0 && (
              <div className="card">
                <PromptHistory
                  prompts={prompts}
                  onSelect={handlePromptSelect}
                  onDelete={removePrompt}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'showcase' && (
          <div>
            {videos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255,255,255,0.2)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎬</div>
                <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '16px', letterSpacing: '2px' }}>
                  NO VIDEOS YET
                </div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Generate your first video to see it here
                </div>
              </div>
            ) : (
              <VideoShowcase videos={videos} onDelete={removeVideo} />
            )}
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

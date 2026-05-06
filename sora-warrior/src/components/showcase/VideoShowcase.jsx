import { useState } from 'react'

function VideoCard({ video, onDelete }) {
  const [playing, setPlaying] = useState(false)

  const date = new Date(video.generatedAt).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{
      background: '#0d1130',
      border: '1px solid rgba(212,175,55,0.15)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      {/* Video */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: video.aspectRatio === '9:16' ? '9/16' : '16/9' }}>
        <video
          src={video.videoUrl}
          controls
          playsInline
          loop
          muted={!playing}
          onClick={() => setPlaying(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Meta */}
      <div style={{ padding: '8px' }}>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '6px',
        }}>
          {video.prompt}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{date}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <a
              href={video.videoUrl}
              download
              style={{
                background: 'rgba(0,200,0,0.1)',
                border: '1px solid rgba(0,255,0,0.2)',
                borderRadius: '4px',
                color: '#00ff00',
                padding: '3px 7px',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                textDecoration: 'none',
              }}
            >
              ⬇
            </a>
            <button
              onClick={() => onDelete(video.id)}
              style={{
                background: 'rgba(255,0,0,0.08)',
                border: '1px solid rgba(255,51,51,0.2)',
                borderRadius: '4px',
                color: '#ff3333',
                padding: '3px 7px',
                cursor: 'pointer',
                fontSize: '10px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VideoShowcase({ videos, onDelete }) {
  if (!videos.length) return null

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '8px' }}>
        Videos ({videos.length}/25)
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

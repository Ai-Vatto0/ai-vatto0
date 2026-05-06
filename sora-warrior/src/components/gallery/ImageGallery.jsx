export function ImageGallery({ images, onSelect }) {
  if (!images.length) return null

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '8px' }}>
        Recent Images ({images.length}/10)
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
      }}>
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelect(img.base64, img.id)}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(212,175,55,0.15)',
              transition: 'border-color 100ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'}
          >
            <img
              src={img.thumbnail}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {img.usedCount > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '3px',
                fontSize: '9px',
                color: 'rgba(212,175,55,0.8)',
                fontWeight: 'bold',
              }}>
                ×{img.usedCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

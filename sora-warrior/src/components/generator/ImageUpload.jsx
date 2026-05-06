import { useRef, useState } from 'react'

export function ImageUpload({ selectedImage, onImageSelected }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelected(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  if (selectedImage) {
    return (
      <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
        <img
          src={selectedImage}
          alt="Selected"
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 150ms ease',
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              background: 'rgba(255,107,53,0.9)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            CHANGE IMAGE
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#ff6b35' : 'rgba(212,175,55,0.25)'}`,
        borderRadius: '4px',
        background: dragging ? 'rgba(255,107,53,0.05)' : 'rgba(255,255,255,0.02)',
        padding: '32px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 100ms ease',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
      <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', marginBottom: '4px' }}>
        DROP IMAGE HERE
      </div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
        or tap to select
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}

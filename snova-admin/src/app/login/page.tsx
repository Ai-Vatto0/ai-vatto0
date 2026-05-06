'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#08061A',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(15,12,36,0.9)',
        border: '1px solid rgba(123,79,255,0.3)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 0 40px rgba(123,79,255,0.1)',
      }}>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'white', marginBottom: '0.25rem' }}>
          Snova Admin
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Nur für Administratoren
        </p>

        {sent ? (
          <p style={{ color: '#00F5FF', textAlign: 'center', fontSize: '0.9375rem' }}>
            Magic Link wurde gesendet. Bitte prüfe deine E-Mail.
          </p>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Admin E-Mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(123,79,255,0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '1rem',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #7B4FFF, #FF2D78)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sende...' : 'Magic Link senden'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

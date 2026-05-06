'use client'
import { useState, useTransition } from 'react'
import { sendTokens } from '@/lib/actions/admin-actions'

const QUICK = [50, 100, 250, 500, 1000] as const

export function FunkenForm() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function handleQuick(val: number) {
    setAmount(val)
    setMsg(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !amount) return
    setMsg(null)
    startTransition(async () => {
      const res = await sendTokens(email, amount as number)
      if (res.success && res.data) {
        setMsg({ type: 'ok', text: `\u2713 ${amount} \u2736 gesendet \u00B7 Neues Guthaben: ${res.data.newBalance.toLocaleString('de-DE')} \u2736` })
        setEmail('')
        setAmount('')
      } else {
        setMsg({ type: 'err', text: `\u2717 ${res.error ?? 'Fehler'}` })
      }
    })
  }

  const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '0.625rem 0.875rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(123,79,255,0.3)',
    borderRadius: '0.5rem',
    color: 'white',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9375rem',
    outline: 'none',
  }

  return (
    <div style={{
      background: 'rgba(15,12,36,0.9)',
      border: '1px solid rgba(255,45,120,0.2)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      marginTop: '1rem',
    }}>
      <h2 style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        fontSize: '1.125rem', color: 'white', margin: '0 0 1rem'
      }}>
        Funken senden
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email" required placeholder="E-Mail des Nutzers"
          value={email} onChange={e => { setEmail(e.target.value); setMsg(null) }}
          style={input} disabled={isPending}
        />
        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
          {QUICK.map(v => (
            <button key={v} type="button" onClick={() => handleQuick(v)}
              disabled={isPending}
              style={{
                padding: '0.35rem 0.625rem',
                background: amount === v ? 'linear-gradient(135deg, #FF2D78, #7B4FFF)' : 'rgba(123,79,255,0.12)',
                border: `1px solid ${amount === v ? 'transparent' : 'rgba(123,79,255,0.3)'}`,
                borderRadius: '0.375rem',
                color: amount === v ? 'white' : '#c4b5fd',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              +{v}
            </button>
          ))}
        </div>
        {/* Custom amount */}
        <input
          type="number" min={1} max={100000} placeholder="Eigener Betrag"
          value={amount === '' ? '' : amount}
          onChange={e => { setAmount(e.target.value ? parseInt(e.target.value) : ''); setMsg(null) }}
          style={input} disabled={isPending}
        />
        <button type="submit" disabled={isPending || !email || !amount}
          style={{
            padding: '0.625rem',
            background: (isPending || !email || !amount)
              ? 'rgba(123,79,255,0.3)'
              : 'linear-gradient(135deg, #FF2D78, #7B4FFF)',
            border: 'none', borderRadius: '0.5rem',
            color: 'white', fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700, fontSize: '1rem', cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Wird gesendet...' : 'Funken senden'}
        </button>
        {msg && (
          <p style={{
            color: msg.type === 'ok' ? '#39FF14' : '#FF2D78',
            fontSize: '0.8125rem', fontFamily: 'Outfit, sans-serif', margin: 0
          }}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  )
}

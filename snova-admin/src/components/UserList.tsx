'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendTokens, setUserRole, banUser, unbanUser } from '@/lib/actions/admin-actions'
import type { AdminUser } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  admin: '#FF2D78',
  beta_tester: '#00F5FF',
  user: 'rgba(255,255,255,0.3)',
}

function btnStyle(color: string) {
  return {
    padding: '0.3rem 0.75rem',
    background: `${color}18`,
    border: `1px solid ${color}55`,
    borderRadius: '0.375rem',
    color: color,
    fontSize: '0.8125rem',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 700 as const,
    cursor: 'pointer',
  }
}

function UserRow({ user }: { user: AdminUser }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tokenAmount, setTokenAmount] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function refresh() { router.refresh() }

  async function handleSendTokens() {
    const amount = parseInt(tokenAmount)
    if (!amount || amount < 1) return
    startTransition(async () => {
      const res = await sendTokens(user.email, amount, 'Admin-Grant via Admin-App')
      if (res.success) {
        setMsg(`Gesendet: ${amount} Funken`)
        setTokenAmount('')
        setShowTokenInput(false)
        setTimeout(() => setMsg(null), 3000)
        refresh()
      } else {
        setMsg(`Fehler: ${res.error}`)
      }
    })
  }

  async function handleRoleChange(newRole: string) {
    startTransition(async () => {
      await setUserRole(user.id, newRole)
      refresh()
    })
  }

  async function handleBanToggle() {
    startTransition(async () => {
      if (user.is_banned) await unbanUser(user.id)
      else await banUser(user.id)
      refresh()
    })
  }

  return (
    <div style={{
      background: user.is_banned ? 'rgba(255,45,120,0.04)' : 'rgba(15,12,36,0.8)',
      border: `1px solid ${user.is_banned ? 'rgba(255,45,120,0.2)' : 'rgba(123,79,255,0.2)'}`,
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '0.75rem',
      opacity: isPending ? 0.6 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ color: user.is_banned ? 'rgba(255,255,255,0.35)' : 'white', fontWeight: 500, margin: '0 0 0.2rem', fontSize: '0.9375rem' }}>
            {user.email}
            {user.is_banned && (
              <span style={{ color: '#FF2D78', fontSize: '0.7rem', marginLeft: '0.5rem' }}>GESPERRT</span>
            )}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', margin: 0 }}>
            {new Date(user.created_at).toLocaleDateString('de-DE')}
            {user.display_name && ` · ${user.display_name}`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#FF2D78', fontSize: '1.25rem', margin: '0 0 0.1rem' }}>
            {user.balance.toLocaleString('de-DE')} ✦
          </p>
          <span style={{
            fontSize: '0.6875rem',
            color: ROLE_COLORS[user.role] ?? 'white',
            border: `1px solid ${(ROLE_COLORS[user.role] ?? 'white')}44`,
            borderRadius: '0.25rem',
            padding: '0.1rem 0.4rem',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
          }}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {showTokenInput ? (
          <>
            <input
              type="number"
              value={tokenAmount}
              onChange={e => setTokenAmount(e.target.value)}
              placeholder="Anzahl"
              style={{
                width: '100px',
                padding: '0.3rem 0.5rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(0,245,255,0.3)',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
            <button onClick={handleSendTokens} style={btnStyle('#00F5FF')}>Senden</button>
            <button onClick={() => setShowTokenInput(false)} style={btnStyle('rgba(255,255,255,0.2)')}>X</button>
          </>
        ) : (
          <button onClick={() => setShowTokenInput(true)} style={btnStyle('#00F5FF')}>+ Funken</button>
        )}

        <select
          value={user.role}
          onChange={e => handleRoleChange(e.target.value)}
          style={{
            padding: '0.3rem 0.5rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(123,79,255,0.3)',
            borderRadius: '0.375rem',
            color: 'white',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          <option value="user">user</option>
          <option value="beta_tester">beta_tester</option>
          <option value="admin">admin</option>
        </select>

        <button
          onClick={handleBanToggle}
          style={btnStyle(user.is_banned ? '#39FF14' : '#FF2D78')}
        >
          {user.is_banned ? 'Entsperren' : 'Sperren'}
        </button>
      </div>

      {msg && (
        <p style={{
          color: msg.startsWith('Fehler') ? '#FF2D78' : '#39FF14',
          fontSize: '0.75rem',
          margin: '0.5rem 0 0',
        }}>
          {msg}
        </p>
      )}
    </div>
  )
}

export function UserList({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('')
  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.display_name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Suche nach E-Mail oder Name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(123,79,255,0.25)',
          borderRadius: '0.5rem',
          color: 'white',
          fontSize: '0.9375rem',
          outline: 'none',
          boxSizing: 'border-box' as const,
          marginBottom: '1rem',
        }}
      />
      {filtered.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>
          Keine Nutzer gefunden
        </p>
      ) : (
        filtered.map(user => <UserRow key={user.id} user={user} />)
      )}
    </div>
  )
}

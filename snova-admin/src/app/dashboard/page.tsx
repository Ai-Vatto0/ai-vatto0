import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FunkenForm } from '@/components/FunkenForm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const sc = createServiceClient()
  const { data: authData } = await sc.auth.admin.listUsers()
  const totalUsers = authData?.users.length ?? 0

  const { data: wallets } = await sc.from('wallets').select('balance')
  const totalFunken = wallets?.reduce((sum: number, w: { balance: number }) => sum + w.balance, 0) ?? 0

  const { data: profiles } = await sc.from('profiles').select('is_banned')
  const bannedCount = profiles?.filter((p: { is_banned: boolean }) => p.is_banned).length ?? 0

  // kie.ai Balance
  let kieBalance: number | null = null
  try {
    const kieRes = await fetch('https://little-feather-704b.vatto0202.workers.dev/api/v1/account/balance', {
      next: { revalidate: 60 }
    })
    if (kieRes.ok) {
      const raw = await kieRes.text()
      kieBalance = parseFloat(raw)
    }
  } catch {
    kieBalance = null
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newThisWeek = authData?.users.filter((u: { created_at: string }) => u.created_at > weekAgo).length ?? 0

  const stats = [
    { label: 'Nutzer gesamt', value: totalUsers, color: '#7B4FFF' },
    { label: 'Neu diese Woche', value: newThisWeek, color: '#00F5FF' },
    { label: 'Funken im System', value: totalFunken.toLocaleString('de-DE'), color: '#FF2D78' },
    { label: 'Gesperrte Accounts', value: bannedCount, color: '#FF6B35' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#08061A', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', margin: 0 }}>
          Snova Admin
        </h1>
        <Link href="/users" style={{
          padding: '0.5rem 1.25rem',
          background: 'linear-gradient(135deg, #7B4FFF, #FF2D78)',
          borderRadius: '0.5rem',
          color: 'white',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          User verwalten &rarr;
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(15,12,36,0.9)',
            border: `1px solid ${stat.color}33`,
            borderRadius: '0.75rem',
            padding: '1.25rem',
            boxShadow: `0 0 20px ${stat.color}11`,
          }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: '0 0 0.4rem', fontFamily: 'Outfit, sans-serif' }}>
              {stat.label}
            </p>
            <p style={{ color: stat.color, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.75rem', margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* kie.ai Balance — volle Breite */}
      <div style={{
        background: 'rgba(15,12,36,0.9)',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        boxShadow: '0 0 20px rgba(0,245,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: '0 0 0.4rem', fontFamily: 'Outfit, sans-serif' }}>
            kie.ai Guthaben
          </p>
          <p style={{ color: '#00F5FF', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.75rem', margin: 0 }}>
            {kieBalance !== null ? `${kieBalance.toLocaleString('de-DE')} Credits` : '—'}
          </p>
        </div>
        <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>⚡</span>
      </div>

      {/* Funken senden */}
      <FunkenForm />

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
        Eingeloggt als {profile.display_name ?? user.email}
      </p>
    </div>
  )
}

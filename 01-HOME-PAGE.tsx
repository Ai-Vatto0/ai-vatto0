// src/app/(app)/page.tsx – HOME/DASHBOARD (Screen 1)

import { createClient } from '@/lib/supabase/server'
import { Plus, Sparkles, Video, Clock } from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { Character, GenerationJob } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Parallel Datenladenladern
  const [profileRes, walletRes, charactersRes, recentJobsRes] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).single(),
    supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
    supabase
      .from('characters')
      .select('*, character_images(image_url, position)')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .eq('dna_confirmed', true)
      .order('last_used_at', { ascending: false })
      .limit(4),
    supabase
      .from('generation_jobs')
      .select('id, job_type, status, funken_cost, created_at, characters(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const displayName = profileRes.data?.display_name ?? 'Creator'
  const balance = walletRes.data?.balance ?? 0
  const characters = (charactersRes.data ?? []) as Character[]
  const recentJobs = (recentJobsRes.data ?? []) as unknown as GenerationJob[]

  const jobLabel = (type: string) =>
    type === 'image' ? 'Character erstellt' : type === 'video' ? 'Video generiert' : 'Generiert'

  return (
    <div className="px-4 py-6 space-y-6" style={{ maxWidth: 390, margin: '0 auto' }}>
      {/* ─── Greeting ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(156,163,175,0.7)', letterSpacing: '0.05em' }}>
          Willkommen zurück
        </p>
        <h1 style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '1.75rem',
          marginTop: '0.125rem',
          background: 'linear-gradient(135deg, #f1f0f5, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {displayName}
        </h1>
      </div>

      {/* ─── Coin Balance ──────────────────────────────────────── */}
      <div className="nova-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(156,163,175,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
            Deine Coins
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✦</span>
            <span style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '2rem',
              color: 'var(--green)',
              textShadow: '0 0 20px rgba(57,255,20,0.4)',
            }}>
              {balance.toLocaleString('de-DE')}
            </span>
          </div>
        </div>
        <Link href="/profile#topup" className="btn-nova-secondary">
          + Aufladen
        </Link>
      </div>

      {/* ─── Quick Actions ─────────────────────────────────────── */}
      <div>
        <p style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--cyan)',
          marginBottom: '0.75rem',
        }}>
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <Link href="/characters/create" className="btn-nova-primary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Sparkles style={{ width: 20, height: 20 }} />
            Neuer Character
          </Link>
          <Link href="/create-studio" className="btn-nova-primary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Video style={{ width: 20, height: 20 }} />
            Create Studio
          </Link>
        </div>
      </div>

      {/* ─── Zuletzt verwendet ────────────────────────────────── */}
      {characters.length > 0 && (
        <div>
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--cyan)',
            marginBottom: '0.75rem',
          }}>
            Zuletzt verwendet
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {characters.map((char: Character) => (
              <Link key={char.id} href={`/characters/${char.id}`} className="nova-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.875rem', color: '#f1f0f5', fontWeight: 600 }}>{char.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Activity ───────────────────────────────────── */}
      {recentJobs.length > 0 && (
        <div>
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--cyan)',
            marginBottom: '0.75rem',
          }}>
            Activity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentJobs.map((job: GenerationJob) => (
              <div key={job.id} className="nova-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock style={{ width: 16, height: 16, color: 'var(--cyan)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#f1f0f5' }}>{jobLabel(job.job_type)}</p>
                  <p style={{ fontSize: '0.625rem', color: 'rgba(156,163,175,0.6)', marginTop: '0.125rem' }}>{timeAgo(job.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

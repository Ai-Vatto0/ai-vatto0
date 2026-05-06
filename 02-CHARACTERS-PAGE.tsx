// src/app/(app)/characters/page.tsx – CHARACTER LIBRARY (Screen 2)

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { CharacterCard } from '@/components/characters/CharacterCard'
import type { Character } from '@/types'

export default async function CharactersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: characters } = await supabase
    .from('characters')
    .select('*, character_images(image_url, position)')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const confirmedChars = (characters ?? []).filter((c: Character) => c.dna_confirmed)
  const draftChars = (characters ?? []).filter((c: Character) => !c.dna_confirmed)

  return (
    <div className="px-4 py-6" style={{ maxWidth: 390, margin: '0 auto' }}>
      {/* ─── Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#f1f0f5' }}>
            Charaktere
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(156,163,175,0.6)', marginTop: '0.125rem' }}>
            {confirmedChars.length} aktive DNA{confirmedChars.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/characters/create"
          className="btn-nova-primary"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '0.625rem 1rem',
            borderRadius: '0.75rem',
            color: 'white',
            textDecoration: 'none',
            width: 'auto',
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Neu
        </Link>
      </div>

      {/* ─── Leer-Zustand ─────────────────────────────────────── */}
      {(characters?.length ?? 0) === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center', gap: '1.25rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '1.25rem', background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 32, height: 32, color: 'var(--pink)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#f1f0f5' }}>
              Noch keine Charaktere
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(156,163,175,0.6)', marginTop: '0.375rem', maxWidth: 260, lineHeight: 1.5 }}>
              Erstelle deinen ersten Anime-Charakter. Das System generiert automatisch Referenzbilder als deine Character DNA.
            </p>
          </div>
          <Link
            href="/characters/create"
            className="btn-nova-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
              fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '0.75rem 1.5rem',
              color: 'white',
              textDecoration: 'none',
              width: 'auto',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Ersten Charakter anlegen
          </Link>
        </div>
      )}

      {/* ─── Entwürfe ─────────────────────────────────────────── */}
      {draftChars.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(156,163,175,0.5)', marginBottom: '0.75rem' }}>
            Entwürfe — DNA noch nicht bestätigt
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {draftChars.map((char: Character) => (
              <CharacterCard key={char.id} character={char} isDraft />
            ))}
          </div>
        </div>
      )}

      {/* ─── Aktive Charaktere ────────────────────────────────── */}
      {confirmedChars.length > 0 && (
        <div>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '0.75rem' }}>
            Character DNA aktiv
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {confirmedChars.map((char: Character) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

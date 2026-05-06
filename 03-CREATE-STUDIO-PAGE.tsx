// src/app/(app)/create-studio/page.tsx – CREATE STUDIO / HERZSTÜCK (Screen 4)

import { createClient } from '@/lib/supabase/server'
import { CreateStudioClient } from '@/components/create/CreateStudioClient'
import type { Character, GenerationCostRule } from '@/types'

export default async function CreateStudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [charactersRes, walletRes, costRulesRes] = await Promise.all([
    supabase
      .from('characters')
      .select('*, character_images(image_url, position)')
      .eq('user_id', user.id)
      .eq('dna_confirmed', true)
      .eq('is_archived', false)
      .order('last_used_at', { ascending: false, nullsFirst: false }),
    supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
    supabase.from('generation_cost_rules').select('*').eq('is_active', true),
  ])

  const characters = (charactersRes.data ?? []) as Character[]
  const balance = walletRes.data?.balance ?? 0
  const costRules = (costRulesRes.data ?? []) as GenerationCostRule[]

  const costMap: Record<string, number> = {}
  costRules.forEach(r => { costMap[r.action_key] = r.funken_cost })

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-snova-text-primary">
          Create Studio
        </h1>
        <p className="text-sm text-snova-text-secondary mt-1">
          Wähle deinen Charakter und erstelle Content.
        </p>
      </div>
      <CreateStudioClient
        characters={characters}
        balance={balance}
        costMap={costMap}
      />
    </div>
  )
}

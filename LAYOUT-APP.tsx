// src/app/(app)/layout.tsx – APP LAYOUT (mit TopBar + BottomNav)

import type { Metadata } from 'next'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Snova Studio',
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Wallet-Balance für TopBar
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar balance={wallet?.balance ?? 0} />
      <main className="flex-1 pb-20 pt-16">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

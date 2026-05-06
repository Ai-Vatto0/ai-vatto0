'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AdminUser, ApiResponse } from '@/types'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')
  return user
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await assertAdmin()
  const sc = createServiceClient()
  const { data: authUsers } = await sc.auth.admin.listUsers()
  if (!authUsers?.users) return []

  const { data: profiles } = await sc.from('profiles').select('id, display_name, role, is_banned')
  const { data: wallets } = await sc.from('wallets').select('user_id, balance')

  return authUsers.users.map((u: { id: string; email?: string; created_at: string }) => {
    const profile = profiles?.find((p: { id: string }) => p.id === u.id)
    const wallet = wallets?.find((w: { user_id: string }) => w.user_id === u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      display_name: profile?.display_name ?? null,
      role: profile?.role ?? 'user',
      balance: wallet?.balance ?? 0,
      is_banned: profile?.is_banned ?? false,
      created_at: u.created_at,
    }
  }).sort((a: AdminUser, b: AdminUser) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function sendTokens(
  targetEmail: string,
  amount: number,
  note?: string
): Promise<ApiResponse<{ newBalance: number }>> {
  await assertAdmin()
  const sc = createServiceClient()

  const { data: authUser } = await sc.auth.admin.listUsers()
  const user = authUser?.users.find((u: { email?: string }) => u.email === targetEmail)
  if (!user) return { success: false, error: 'Nutzer nicht gefunden' }

  const { data: wallet } = await sc.from('wallets').select('id').eq('user_id', user.id).single()
  if (!wallet) return { success: false, error: 'Wallet nicht gefunden' }

  const { error } = await sc.rpc('add_funken', {
    p_user_id: user.id,
    p_amount: amount,
    p_type: 'admin_grant',
    p_description: note ?? `Admin-Grant: ${amount} Funken`,
  })
  if (error) return { success: false, error: 'Fehler beim Senden' }

  const { data: updatedWallet } = await sc.from('wallets').select('balance').eq('user_id', user.id).single()
  return { success: true, data: { newBalance: updatedWallet?.balance ?? 0 } }
}

export async function setUserRole(userId: string, role: string): Promise<ApiResponse> {
  await assertAdmin()
  const sc = createServiceClient()
  const { error } = await sc.from('profiles').update({ role }).eq('id', userId)
  if (error) return { success: false, error: 'Fehler beim Ändern der Rolle' }
  return { success: true }
}

export async function banUser(userId: string): Promise<ApiResponse> {
  await assertAdmin()
  const sc = createServiceClient()
  const { error } = await sc.from('profiles').update({ is_banned: true }).eq('id', userId)
  if (error) return { success: false, error: 'Sperren fehlgeschlagen' }
  return { success: true }
}

export async function unbanUser(userId: string): Promise<ApiResponse> {
  await assertAdmin()
  const sc = createServiceClient()
  const { error } = await sc.from('profiles').update({ is_banned: false }).eq('id', userId)
  if (error) return { success: false, error: 'Entsperren fehlgeschlagen' }
  return { success: true }
}

export async function getUserLedger(userId: string) {
  await assertAdmin()
  const sc = createServiceClient()
  const { data } = await sc.from('wallet_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

import { getAdminUsers } from '@/lib/actions/admin-actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserList } from '@/components/UserList'
import Link from 'next/link'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const users = await getAdminUsers()

  return (
    <div style={{ minHeight: '100vh', background: '#08061A', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.875rem' }}>
          &larr; Dashboard
        </Link>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', margin: 0 }}>
          Nutzer ({users.length})
        </h1>
      </div>
      <UserList users={users} />
    </div>
  )
}

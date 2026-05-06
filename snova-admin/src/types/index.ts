export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | 'beta_tester'
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface WalletLedgerEntry {
  id: string
  user_id: string
  type: 'debit' | 'credit' | 'bonus' | 'topup' | 'refund'
  amount: number
  balance_after: number
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  display_name: string | null
  role: 'user' | 'admin' | 'beta_tester'
  balance: number
  is_banned: boolean
  created_at: string
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Domain entities for Renovaciones App
// These are framework-agnostic — no Expo, React, or React Native imports

export type RenewalStatus = 'active' | 'expiring_soon' | 'expired' | 'cancelled'

export interface Renewal {
  id: string
  name: string
  type: string
  start_date: string
  end_date: string
  cost: number
  status: RenewalStatus
  catalog_id?: string
  notes?: string
  attachments?: string[]
  created_at: string
  updated_at: string
}

export interface Catalog {
  id: string
  name: string
  description?: string
  items_count: number
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  notifications_enabled: boolean
  theme: 'light' | 'dark' | 'system'
  reminder_days: number
}

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

/** Read model returned by the existing renewals API and consumed by the app. */
export interface RenewalListItem {
  id: string
  userId: string
  name: string
  type: string
  frequency: string
  cost: number
  currency: string
  renewalDate: string | Date
  provider: string | null
  notes: string | null
  color: string | null
  icon: string | null
  notificationEnabled: boolean
  notificationDaysBefore: number
  status: string
  paymentMethod: string | null
  bankAccount: string | null
  tags: unknown[]
  autoRenew: boolean
  contractEndDate: string | Date | null
  attachments: unknown[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Catalog {
  id: string
  name: string
  description?: string
  items_count: number
  created_at: string
}

/** Persisted user-owned category consumed by the renewal catalog picker. */
export interface CustomCatalog {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  options: unknown[]
  createdAt: string
  updatedAt: string
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

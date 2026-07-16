-- Migration: Supabase → Neon for RenovacionesApp
-- Creates all tables previously in Supabase

-- Users table (replaces Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  whatsapp_number TEXT,
  telegram_chat_id TEXT,
  sms_number TEXT,
  email_address TEXT,
  notifications_enabled BOOLEAN DEFAULT false,
  notification_method TEXT DEFAULT 'none' CHECK (notification_method IN ('none', 'email', 'sms', 'whatsapp', 'telegram', 'push')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  frequency TEXT DEFAULT 'monthly',
  cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  renewal_date DATE NOT NULL,
  provider TEXT,
  notes TEXT,
  color TEXT,
  icon TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_days_before INT DEFAULT 7,
  status TEXT DEFAULT 'active',
  payment_method TEXT,
  bank_account TEXT,
  tags JSONB DEFAULT '[]',
  auto_renew BOOLEAN DEFAULT false,
  contract_end_date DATE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_date ON renewals(renewal_date);

-- Renewal history table
CREATE TABLE IF NOT EXISTS renewal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id UUID NOT NULL REFERENCES renewals(id) ON DELETE CASCADE,
  old_cost NUMERIC(10,2),
  new_cost NUMERIC(10,2),
  old_frequency TEXT,
  new_frequency TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_renewal_history_renewal_id ON renewal_history(renewal_id);

-- User catalogs table
CREATE TABLE IF NOT EXISTS user_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag.fill',
  color TEXT DEFAULT '#007AFF',
  options JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_catalogs_user_id ON user_catalogs(user_id);

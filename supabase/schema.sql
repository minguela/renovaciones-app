-- Supabase Schema for RenovacionesApp
-- Idempotent version: can be run multiple times safely

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  whatsapp_number TEXT,
  telegram_chat_id TEXT,
  sms_number TEXT,
  email_address TEXT,
  notifications_enabled BOOLEAN DEFAULT false,
  notification_method TEXT DEFAULT 'none' CHECK (notification_method IN ('none', 'email', 'sms', 'whatsapp', 'telegram', 'push')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'biannual', 'annual', 'one-time')),
  cost DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  renewal_date DATE NOT NULL,
  provider TEXT,
  notes TEXT,
  color TEXT,
  icon TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 7,
  status TEXT DEFAULT 'active',
  payment_method TEXT CHECK (payment_method IN ('card', 'direct_debit', 'paypal', 'bizum', 'other')),
  bank_account TEXT,
  tags TEXT[] DEFAULT '{}',
  auto_renew BOOLEAN DEFAULT true,
  contract_end_date DATE,
  notification_method TEXT DEFAULT 'push' CHECK (notification_method IN ('push', 'email', 'sms', 'whatsapp', 'telegram')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns idempotently (for existing tables)
DO $$
BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_number TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_address TEXT;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS bank_account TEXT;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS contract_end_date DATE;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS notification_method TEXT DEFAULT 'push';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Renewals policies
DROP POLICY IF EXISTS "Users can view own renewals" ON renewals;
CREATE POLICY "Users can view own renewals"
  ON renewals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own renewals" ON renewals;
CREATE POLICY "Users can create own renewals"
  ON renewals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own renewals" ON renewals;
CREATE POLICY "Users can update own renewals"
  ON renewals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own renewals" ON renewals;
CREATE POLICY "Users can delete own renewals"
  ON renewals FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS renewals_updated_at ON renewals;
CREATE TRIGGER renewals_updated_at
  BEFORE UPDATE ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Renewal history table
CREATE TABLE IF NOT EXISTS renewal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id UUID REFERENCES renewals(id) ON DELETE CASCADE NOT NULL,
  old_cost DECIMAL(10, 2),
  new_cost DECIMAL(10, 2),
  old_frequency TEXT,
  new_frequency TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE renewal_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own renewal history" ON renewal_history;
CREATE POLICY "Users can view own renewal history"
  ON renewal_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM renewals WHERE renewals.id = renewal_history.renewal_id AND renewals.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create own renewal history" ON renewal_history;
CREATE POLICY "Users can create own renewal history"
  ON renewal_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM renewals WHERE renewals.id = renewal_history.renewal_id AND renewals.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own renewal history" ON renewal_history;
CREATE POLICY "Users can delete own renewal history"
  ON renewal_history FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM renewals WHERE renewals.id = renewal_history.renewal_id AND renewals.user_id = auth.uid()
  ));

-- Enable realtime for renewals
ALTER TABLE renewals REPLICA IDENTITY FULL;
ALTER TABLE renewal_history REPLICA IDENTITY FULL;

-- =====================================================
-- USER CUSTOM CATALOGS (types & categories)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag.fill',
  color TEXT DEFAULT '#007AFF',
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own catalogs" ON user_catalogs;
CREATE POLICY "Users can view own catalogs"
  ON user_catalogs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own catalogs" ON user_catalogs;
CREATE POLICY "Users can create own catalogs"
  ON user_catalogs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own catalogs" ON user_catalogs;
CREATE POLICY "Users can update own catalogs"
  ON user_catalogs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own catalogs" ON user_catalogs;
CREATE POLICY "Users can delete own catalogs"
  ON user_catalogs FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS user_catalogs_updated_at ON user_catalogs;
CREATE TRIGGER user_catalogs_updated_at
  BEFORE UPDATE ON user_catalogs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

ALTER TABLE user_catalogs REPLICA IDENTITY FULL;

-- Storage bucket for attachments
-- Note: create the 'attachments' bucket manually in Supabase Dashboard > Storage
-- Then run these policies:

DROP POLICY IF EXISTS "Users can upload own attachments" ON storage.objects;
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can view own attachments" ON storage.objects;
CREATE POLICY "Users can view own attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'attachments' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can update own attachments" ON storage.objects;
CREATE POLICY "Users can update own attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'attachments' AND auth.uid() = owner);

-- =====================================================
-- NOTIFICATIONS INFRASTRUCTURE
-- =====================================================

-- Push tokens table (Expo + Web Push)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('expo', 'web')),
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push tokens" ON push_tokens;
CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notification log (tracks every sent notification)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  renewal_id UUID REFERENCES renewals(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'telegram', 'push')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  subject TEXT,
  body TEXT,
  recipient TEXT,
  error_message TEXT,
  provider_response JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notification logs" ON notification_logs;
CREATE POLICY "Users view own notification logs"
  ON notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS push_tokens_updated_at ON push_tokens;
CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- VAPID keys for web push (stored as app config, single row)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for notifications
ALTER TABLE push_tokens REPLICA IDENTITY FULL;
ALTER TABLE notification_logs REPLICA IDENTITY FULL;

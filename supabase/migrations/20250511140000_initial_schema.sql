-- Supabase Schema for RenovacionesApp
-- Idempotent version: can be run multiple times safely

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  whatsapp_number TEXT,
  telegram_chat_id TEXT,
  notifications_enabled BOOLEAN DEFAULT false,
  notification_method TEXT DEFAULT 'none' CHECK (notification_method IN ('none', 'whatsapp', 'telegram', 'email')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('insurance', 'subscription', 'license', 'other')),
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
  payment_method TEXT,
  bank_account TEXT,
  tags TEXT[] DEFAULT '{}',
  auto_renew BOOLEAN DEFAULT true,
  contract_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns idempotently (for existing tables)
DO $$
BEGIN
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS bank_account TEXT;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
  ALTER TABLE renewals ADD COLUMN IF NOT EXISTS contract_end_date DATE;
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

-- Enable realtime for renewals
ALTER TABLE renewals REPLICA IDENTITY FULL;

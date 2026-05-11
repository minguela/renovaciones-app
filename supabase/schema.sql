-- Supabase Schema for RenovacionesApp
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
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
CREATE TABLE renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Renewals policies
CREATE POLICY "Users can view own renewals"
  ON renewals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own renewals"
  ON renewals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own renewals"
  ON renewals FOR UPDATE
  USING (auth.uid() = user_id);

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
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER renewals_updated_at
  BEFORE UPDATE ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for renewals
ALTER TABLE renewals REPLICA IDENTITY FULL;

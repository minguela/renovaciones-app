-- Create notification infrastructure tables if they don't exist

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

-- Notification log
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

-- VAPID keys and app config
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert VAPID keys
INSERT INTO app_config (key, value)
VALUES
  ('vapid_public_key', '-H2CxCHnxbYyozeMa0SUu4hYj8MJCu_PaPepR4cuafg'),
  ('vapid_private_key', 'iWRyHOyIjH2mfQYXepYDk6sIY1b5V2dvzzjMjfEVMDI')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Enable realtime
ALTER TABLE push_tokens REPLICA IDENTITY FULL;
ALTER TABLE notification_logs REPLICA IDENTITY FULL;

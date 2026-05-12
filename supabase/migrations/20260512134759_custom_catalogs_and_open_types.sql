-- Remove CHECK constraint from renewals.type to allow custom types
ALTER TABLE renewals DROP CONSTRAINT IF EXISTS renewals_type_check;

-- Create user_catalogs table for custom categories
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

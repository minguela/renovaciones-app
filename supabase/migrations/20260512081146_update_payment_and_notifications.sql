-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_address TEXT;

-- Update notification_method check on profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_notification_method_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_notification_method_check CHECK (notification_method IN ('none', 'email', 'sms', 'whatsapp', 'telegram', 'push'));

-- Add notification_method to renewals
ALTER TABLE renewals ADD COLUMN IF NOT EXISTS notification_method TEXT DEFAULT 'push';
ALTER TABLE renewals DROP CONSTRAINT IF EXISTS renewals_notification_method_check;
ALTER TABLE renewals ADD CONSTRAINT renewals_notification_method_check CHECK (notification_method IN ('push', 'email', 'sms', 'whatsapp', 'telegram'));

-- Update payment_method check on renewals
ALTER TABLE renewals DROP CONSTRAINT IF EXISTS renewals_payment_method_check;
ALTER TABLE renewals ADD CONSTRAINT renewals_payment_method_check CHECK (payment_method IN ('card', 'direct_debit', 'paypal', 'bizum', 'other'));

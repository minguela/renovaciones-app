-- Versioned, additive identity support for the staged Clerk migration.
-- This file is intentionally NOT executed by app startup or deployment scripts.
-- Apply only after a reviewed export, collision report, and explicit cutover plan.
-- Keep users.id and all existing owner foreign keys unchanged.
BEGIN;

-- Fail before changing auth semantics if existing accounts have case-insensitive
-- email duplicates. Resolve these explicitly before applying the migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT lower(email)
    FROM users
    GROUP BY lower(email)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enable Clerk identities: users contains case-insensitive email duplicates';
  END IF;
END $$;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
CREATE UNIQUE INDEX users_email_case_insensitive_unique ON users (lower(email));

CREATE TABLE auth_identity_links (
  clerk_user_id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  linked_by TEXT NOT NULL CHECK (linked_by IN ('verified-legacy-session', 'clerk-self-signup', 'manual-review'))
);

COMMENT ON TABLE auth_identity_links IS
  'Clerk subject to stable users.id owner map; rollback leaves links and all user data intact.';

COMMIT;

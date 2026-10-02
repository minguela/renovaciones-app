-- Versioned, additive identity map for the staged Clerk migration.
-- This file is intentionally NOT executed by app startup or deployment scripts.
-- Apply only after a reviewed export, collision report, and explicit cutover plan.
-- Keep legacy users.id and all existing owner foreign keys unchanged.
CREATE TABLE auth_identity_links (
  clerk_user_id TEXT PRIMARY KEY,
  legacy_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  linked_by TEXT NOT NULL CHECK (linked_by IN ('verified-legacy-session', 'manual-review'))
);

COMMENT ON TABLE auth_identity_links IS
  'Reviewed Clerk subject to existing users.id map; application rollback leaves links and legacy data intact.';

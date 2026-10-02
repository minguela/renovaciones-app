# Clerk identity migration — staged implementation

**Status:** local app code and an additive migration draft are present. The migration has not been applied, Clerk keys and Google factors have not been checked, and no identity or app data has been moved.

## Stable owner and identity rules

- Existing resource ownership stays on `users.id`; renewals, profiles, catalogs, and history are not rewritten.
- `auth_identity_links.owner_user_id` maps at most one Clerk subject to one existing app owner, and each owner to at most one Clerk subject. Both unique constraints reject competing links.
- A Clerk session with a mapping resolves to that mapped `users.id`. An unmapped session cannot fall back to legacy JWT identity or select an owner from request data.
- Existing-account linking requires two active proofs in one request: the verified Clerk session bearer and a separately verified legacy JWT obtained by checking the user's legacy password. The endpoint links the Clerk `sub` to the exact legacy JWT `sub`; it does not compare email, update `users`, or move ownership.
- Clerk-first signup calls the server-only Clerk Backend API for the primary email and requires Clerk's verification status to be `verified`. The client does not submit an email for provisioning. If a case-insensitive email already belongs to an app account, the endpoint returns 409 and asks the user to prove that account through the explicit link flow. It never auto-links on matching email.
- A new Clerk-only `users` row has `password_hash = NULL`; password login explicitly rejects it. New owner, profile, and identity-link rows are created in a single database transaction. A profile-creation or link failure rolls back the owner row as well.
- Email and Clerk-subject advisory locks serialize concurrent app provisioning. The lower-case unique email index is the final race guard, including collision with legacy registrations that do not take the advisory lock.

## Migration and rollout gates

`migrations/20261001_auth_identity_links.sql` is versioned and additive. It expands password storage for Clerk-only owners, adds the case-insensitive email uniqueness guard, and creates the identity map without changing any existing ID or owner foreign key. A duplicate-email check stops the migration before applying changes if case-insensitive duplicates exist. Do not run it until a reviewed export, per-table counts, collision report, and migration/rollback plan exist.

The migration is not called by application startup or deployment scripts. Application rollback means returning to legacy authentication while leaving the identity table and existing users/data intact. Do not delete identity rows or app rows as rollback.

Before a real migration:

1. Back up the target Neon database and record users, profiles, renewals, history, and catalogs counts and representative owner IDs.
2. Report case-insensitive email collisions, Google subject collisions, orphaned foreign keys, and attachment sizes. Resolve each affected account manually; never merge based on email alone.
3. Apply the migration in an isolated preview database, then exercise signup, explicit link, conflict, rollback, old password login, and two-owner isolation.
4. Review every intended identity pair. Read back exact mapping rows, per-table counts, and sample owner IDs before enabling the flow for more accounts.
5. Re-run the same checks in production only after an explicit release decision. This local branch contains no production database or provider changes.

## Remaining live verification

- Configure and confirm Clerk server/publishable keys, Google connection, authorized parties, email verification requirements, and Expo Native API in Clerk Dashboard.
- Complete Google sign-in in the actual Vercel preview on web and a native development build. Confirm callback URLs, Clerk session persistence after restart, logout, expiry, and recovery.
- Run `e2e/api/clerk-identity-database.integration.spec.ts` only with a dedicated `TEST_DATABASE_URL`; it is skipped without that variable. This exercises Postgres constraints and rollback against that test database, not live Neon production.
- Run the actual data export, collision report, migration, exact identity-link review, and two-user read/write isolation checks against a backed-up preview database before any production cutover.
- Existing legacy Google OAuth behavior is separate from Clerk linking and must retain an explicit owner-proof boundary; do not add a path that matches legacy users by email.

No existing account, database, or data was deleted or migrated in this branch.

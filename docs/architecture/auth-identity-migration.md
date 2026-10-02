# Clerk identity migration — provisional boundary

**Status:** local integration code is present behind environment configuration.
No identity migration has been applied and no legacy account has been linked;
Clerk is not operational in the inspected environment.

## Ownership and actor resolution

Existing resource ownership remains keyed by `users.id` (UUID). The staged
identity map in `migrations/20261001_auth_identity_links.sql` links a verified
Clerk subject to exactly one existing user UUID; it does not rewrite user IDs,
renewals, profiles, catalogs, or history. Both sides are unique, and the
foreign key uses `ON DELETE RESTRICT` to protect existing users.

`api/server-actor.ts` defines the server actor boundary. The production resolver
in `api/legacy-actor.ts` now verifies Clerk tokens through the installed
`@clerk/backend` verifier when `CLERK_SECRET_KEY` and a non-empty
`CLERK_AUTHORIZED_PARTIES` list are present, then requires an explicit
`auth_identity_links` row to resolve the existing `users.id`. The verifier checks
the signature, authorized party, subject, expiry, and not-before claim. A
verified but unlinked Clerk subject is denied without legacy-token fallback.
When Clerk configuration is absent, existing legacy JWT authentication remains
available. No ownership is inferred from email or from API request data.

The actor resolver is wired into renewal and catalog GET/POST/PUT/DELETE,
history, `/api/auth/me`, profiles, and user-triggered notifications. Cron
authentication remains separate. The frontend provider and Clerk token cache
are conditional on `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`; Clerk bearer tokens are
used for API calls while a Clerk session is active, with an explicit switch back
to the recoverable legacy login screen.

## Migration and rollback

The SQL file is versioned and additive. It is not referenced by app startup,
`scripts/run-migration.js`, or the existing Neon bootstrap, and has not been
executed. Applying it requires a reviewed data export and collision report.
Rollback means returning application auth to the legacy JWT path while leaving
the new map and all old rows in place; do not drop linked identities as part of
application rollback.

Before an eventual cutover, record per-table counts and inspect normalized
email collisions, Google ID collisions, orphaned references, and attachment
sizes in the actual preview and production databases. Resolve duplicate or
unverifiable accounts explicitly. Do not merge accounts or infer ownership
from matching email addresses. After linking, read back counts and sample
ownership for each account before enabling Clerk-only traffic.

## Authentication status and required real checks

- Legacy email/password and Google JWT endpoints and existing user rows remain
  in place.
- The current web Google callback returns the app JWT in a URL query parameter;
  this has not been replaced in this provisional patch.
- The current native Google client sends a placeholder authorization code;
  native sign-in is not functional and is not made functional by adding this
  actor boundary.
- The inspected `.env` and `.env.local` did not contain Clerk publishable or
  secret keys; no provider secrets were configured. The migration SQL remains
  unapplied and has no reviewed identity rows, so Clerk sessions currently
  cannot access legacy data.
- The implementation targets installed `@clerk/expo` 4.8.0 / Core 3. Its
  experimental `useSSO` hook is imported from the installed `/experimental`
  export, and session tokens use Clerk's `tokenCache` backed by
  `expo-secure-store`. A web export succeeds, but this does not verify SSO or
  dashboard factors.
- Clerk password and Google flows require the corresponding factors to be
  enabled in the Clerk instance. Google SSO additionally requires Native API
  enabled. These console settings were not available for inspection, so Google
  and password sign-in are not declared operational.
- The Clerk Expo config plugin needs a fresh native development build (iOS
  deployment target 17 or newer). No development binary or authenticated
  session was available; session persistence across restart remains unverified.
- A real release gate still needs reviewed identity-link rows, a web sign-in
  and callback, Google auth return, expiration, logout, two-user data
  isolation, and a native development-build session restart test. No existing
  account, database, or data was deleted or migrated here.

Keep Vercel cron authentication, scheduled renewal reminders, push handling,
and email/Telegram/WhatsApp service credentials separate from user login.

# ADR: Application and persistence boundaries for renewal writes

- **Status:** Accepted for the local API refactor
- **Date:** 2026-10-01

## Decision

Renewal and custom-catalog write routes use server-authenticated application use cases and repository ports. Neon adapters own SQL, row mapping, and persistence defaults. API handlers retain HTTP status codes and wire DTOs. Resource ownership comes from the server actor resolved from a verified legacy JWT or a verified Clerk subject with an explicit identity-map row; request bodies and query strings never select an owner.

The renewal and catalog GET paths remain independently routed through their existing list use cases. This keeps the present public endpoints while moving POST, PUT, and DELETE out of route modules.

## Compatibility constraints

- Keep the legacy JWT verifier and current bearer-token behavior. Conditional Clerk resolution requires server keys, an authorized-party allowlist, and a reviewed identity mapping; otherwise legacy auth remains available and unlinked Clerk users are denied.
- Preserve POST defaults, update/delete owner predicates, response DTOs, and 201/200/404/401/405 behavior.
- Keep the current client sequence for a cost/frequency change: `POST /api/history` followed by `PUT /api/renewals`. This refactor does not change history semantics or claim that the two requests are atomic.
- Do not change database schema or run migrations as part of this refactor.

## Local schema observation

The checked-in `supabase/schema.sql` declares `renewals.tags` as `TEXT[]` and adds `renewals.attachments` as `TEXT[]`. The current Neon API sends both fields using `JSON.stringify` and parses string values with `JSON.parse`. Keep that behavior unchanged here; verify the deployed Neon column types separately before proposing a data-format or schema migration.

## Verification limits

API tests inject identity resolvers and Neon query adapters. Passing them proves handler/use-case/adapter behavior under those seams, not Clerk dashboard configuration, Google OAuth, a native Expo session, or live Neon state. Clerk's Expo token cache is configured with SecureStore, but native persistence still needs device/account verification. The legacy login path remains accessible from the Clerk screen.

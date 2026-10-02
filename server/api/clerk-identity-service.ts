export interface IdentityTransaction {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[]; rowCount?: number | null }>;
}

export class IdentityConflictError extends Error {
  readonly statusCode = 409;
  readonly code = 'identity_conflict';

  constructor(message = 'La identidad ya está asociada a otra cuenta.') {
    super(message);
    this.name = 'IdentityConflictError';
  }
}

export class IdentityOwnerNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = 'legacy_owner_not_found';

  constructor() {
    super('No se encontró la cuenta anterior.');
    this.name = 'IdentityOwnerNotFoundError';
  }
}

/** Creates a new Clerk-only owner, profile, and mapping without touching existing owners. */
export async function provisionClerkOwner(
  tx: IdentityTransaction,
  clerkUserId: string,
  verifiedEmail: string,
) {
  await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 1))', [clerkUserId]);
  const existing = await tx.query(
    `SELECT u.id, u.email FROM auth_identity_links l
     JOIN users u ON u.id = l.owner_user_id
     WHERE l.clerk_user_id = $1 FOR UPDATE OF u`,
    [clerkUserId],
  );
  if (existing.rows[0]) return existing.rows[0];

  const email = verifiedEmail.trim().toLowerCase();
  if (!email) throw new TypeError('A verified primary email is required.');

  // Serialize Clerk signups by case-insensitive email. The database unique
  // index is the final guard against concurrent legacy signup requests.
  await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 2))', [email]);
  const collision = await tx.query('SELECT id FROM users WHERE lower(email) = $1 LIMIT 1', [email]);
  if (collision.rows.length > 0) throw new IdentityConflictError('Ya existe una cuenta con ese correo. Inicia sesión con ella para vincular Clerk.');

  try {
    const inserted = await tx.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, NULL) RETURNING id, email`,
      [email],
    );
    const owner = inserted.rows[0];
    if (!owner?.id) throw new Error('Could not create the account owner.');

    await tx.query(
      `INSERT INTO profiles (user_id, email, notifications_enabled, notification_method)
       VALUES ($1, $2, false, 'none')`,
      [owner.id, email],
    );
    await tx.query(
      `INSERT INTO auth_identity_links (clerk_user_id, owner_user_id, linked_by)
       VALUES ($1, $2, 'clerk-self-signup')`,
      [clerkUserId, owner.id],
    );
    return owner;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new IdentityConflictError('La cuenta o identidad ya existe. No se han combinado datos.');
    }
    throw error;
  }
}

/** Links only the exact owner proved by a valid legacy JWT; email is not consulted. */
export async function linkClerkToLegacyOwner(
  tx: IdentityTransaction,
  clerkUserId: string,
  legacyUserId: string,
) {
  await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 1))', [clerkUserId]);
  const existing = await tx.query(
    `SELECT u.id, u.email FROM auth_identity_links l
     JOIN users u ON u.id = l.owner_user_id
     WHERE l.clerk_user_id = $1 FOR UPDATE OF u`,
    [clerkUserId],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].id === legacyUserId) return existing.rows[0];
    throw new IdentityConflictError();
  }

  const ownerResult = await tx.query('SELECT id, email FROM users WHERE id = $1 FOR UPDATE', [legacyUserId]);
  const owner = ownerResult.rows[0];
  if (!owner) throw new IdentityOwnerNotFoundError();

  try {
    await tx.query(
      `INSERT INTO auth_identity_links (clerk_user_id, owner_user_id, linked_by)
       VALUES ($1, $2, 'verified-legacy-session')`,
      [clerkUserId, legacyUserId],
    );
  } catch (error) {
    if (isUniqueViolation(error)) throw new IdentityConflictError();
    throw error;
  }
  return owner;
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505');
}

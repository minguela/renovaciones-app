import { withTransaction } from './db';

export class GoogleAccountLinkRequiredError extends Error {
  readonly statusCode = 409;
  readonly code = 'account_link_required';

  constructor() {
    super('Esta cuenta de Google coincide con una cuenta existente. Inicia sesión con tu acceso anterior para vincularla.');
    this.name = 'GoogleAccountLinkRequiredError';
  }
}

/** Resolves an already recorded Google subject; email equality never links accounts. */
export async function findOrCreateGoogleUser(googleUser: { id: string; email?: string; picture?: string | null }) {
  const email = (googleUser.email || '').toLowerCase().trim();
  if (!email || !googleUser.id) throw new Error('Google did not return a valid account identity.');

  return withTransaction(async (tx) => {
    await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 3))', [googleUser.id]);
    const byGoogleSubject = await tx.query(
      'SELECT id, email FROM users WHERE google_id = $1 FOR UPDATE',
      [googleUser.id],
    );
    if (byGoogleSubject.rows[0]) {
      return { userId: byGoogleSubject.rows[0].id, email: byGoogleSubject.rows[0].email };
    }

    await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 2))', [email]);
    const emailCollision = await tx.query('SELECT id FROM users WHERE lower(email) = $1 LIMIT 1', [email]);
    if (emailCollision.rows.length > 0) throw new GoogleAccountLinkRequiredError();

    const inserted = await tx.query(
      'INSERT INTO users (email, google_id, avatar_url) VALUES ($1, $2, $3) RETURNING id',
      [email, googleUser.id, googleUser.picture || null],
    );
    const userId = inserted.rows[0]?.id;
    if (!userId) throw new Error('Could not create the Google account.');
    await tx.query(
      'INSERT INTO profiles (user_id, email, notifications_enabled, notification_method) VALUES ($1, $2, true, $3)',
      [userId, email, 'email'],
    );
    return { userId, email };
  });
}

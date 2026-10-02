import { verifyToken } from './auth-helpers';
import { query } from './db';
import { verifyClerkSessionToken } from './clerk-token-verifier';
import { createServerActorResolver } from './server-actor';

export const resolveServerActor = createServerActorResolver({
  verifyClerkToken: verifyClerkSessionToken,
  findLegacyUserIdByClerkId: async (clerkUserId) => {
    const { rows } = await query(
      'SELECT legacy_user_id FROM auth_identity_links WHERE clerk_user_id = $1',
      [clerkUserId],
    );
    return rows[0]?.legacy_user_id || null;
  },
  verifyLegacyToken: async (token) => {
    const claims = verifyToken(token);
    return claims?.sub ? { sub: claims.sub } : null;
  },
});

import { verifyToken } from '../../auth-helpers';
import { withTransaction } from '../../db';
import { verifyClerkSessionToken } from '../../clerk-token-verifier';
import { IdentityConflictError, IdentityOwnerNotFoundError, linkClerkToLegacyOwner } from '../../clerk-identity-service';

export function createClerkLegacyLinkHandler(dependencies: {
  verifyClerk: (token: string) => Promise<{ sub: string } | null>;
  verifyLegacy: (token: string) => Promise<{ sub: string } | null>;
  link: (clerkUserId: string, legacyUserId: string) => Promise<{ id: string; email: string }>;
}) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const clerkToken = getBearerToken(req);
    const legacyToken = typeof req.body?.legacyToken === 'string' ? req.body.legacyToken : '';
    if (!clerkToken || !legacyToken) return res.status(401).json({ error: 'Both active sessions are required.' });

    const [clerkSubject, legacySubject] = await Promise.all([
      dependencies.verifyClerk(clerkToken),
      dependencies.verifyLegacy(legacyToken),
    ]);
    if (!clerkSubject?.sub || !legacySubject?.sub) return res.status(401).json({ error: 'Both active sessions are required.' });

    try {
      const owner = await dependencies.link(clerkSubject.sub, legacySubject.sub);
      return res.status(200).json(owner);
    } catch (error) {
      if (error instanceof IdentityConflictError) return res.status(409).json({ code: error.code, error: error.message });
      if (error instanceof IdentityOwnerNotFoundError) return res.status(404).json({ code: error.code, error: error.message });
      console.error('Clerk legacy account linking failed:', error);
      return res.status(503).json({ error: 'No se pudo completar el enlace seguro. Inténtalo de nuevo.' });
    }
  };
}

export const handler = createClerkLegacyLinkHandler({
  verifyClerk: verifyClerkSessionToken,
  verifyLegacy: async (token) => {
    const claims = verifyToken(token);
    return claims?.sub ? { sub: claims.sub } : null;
  },
  link: (clerkUserId, legacyUserId) => withTransaction((tx) => linkClerkToLegacyOwner(tx, clerkUserId, legacyUserId)),
});

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

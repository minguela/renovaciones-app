import { verifyToken } from '@clerk/backend';

interface ClerkClaims {
  sub?: unknown;
  exp?: unknown;
  nbf?: unknown;
}

type ClerkVerificationResult = ClerkClaims | { data?: ClerkClaims; errors?: unknown[] };

interface ClerkTokenVerifierDependencies {
  secretKey: string | undefined;
  authorizedParties: string[];
  now?: () => number;
  verifyToken: (token: string, options: {
    secretKey: string;
    authorizedParties: string[];
  }) => Promise<ClerkVerificationResult>;
}

/** Creates a fail-closed verifier for Clerk session JWTs. */
export function createClerkSessionTokenVerifier({
  secretKey,
  authorizedParties,
  now = Date.now,
  verifyToken: verify,
}: ClerkTokenVerifierDependencies) {
  return async (token: string): Promise<{ sub: string } | null> => {
    if (!secretKey || !authorizedParties.length) return null;

    try {
      const result = await verify(token, { secretKey, authorizedParties });
      const envelope = result as { data?: ClerkClaims; errors?: unknown[] };
      const claims = envelope.data ?? (('sub' in result) ? result as ClerkClaims : undefined);
      if (envelope.errors?.length) return null;
      if (!claims || typeof claims.sub !== 'string' || !claims.sub) return null;
      if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp <= now() / 1000) return null;
      if (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || !Number.isFinite(claims.nbf) || claims.nbf > now() / 1000)) return null;
      return { sub: claims.sub };
    } catch {
      return null;
    }
  };
}

const authorizedParties = (process.env.CLERK_AUTHORIZED_PARTIES || '')
  .split(',')
  .map((party) => party.trim())
  .filter(Boolean);

export const verifyClerkSessionToken = createClerkSessionTokenVerifier({
  secretKey: process.env.CLERK_SECRET_KEY,
  authorizedParties,
  verifyToken: (token, options) => verifyToken(token, options),
});

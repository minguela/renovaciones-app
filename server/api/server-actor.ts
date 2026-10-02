/**
 * Server-side identity boundary shared by API routes.
 *
 * Clerk verification and identity lookup are explicit dependencies so tests can
 * prove the boundary independently from secrets and live database state. The
 * production resolver enables them only when its server configuration is set.
 */
export interface ServerActor {
  /** Existing internal users.id. Resource ownership continues to use this ID. */
  userId: string;
  identityProvider: 'legacy-jwt' | 'clerk';
}

interface VerifiedSubject {
  sub: string;
}

export interface ServerActorResolverDependencies {
  /** Must cryptographically verify signature, issuer, audience, and expiry. */
  verifyClerkToken?: (token: string) => Promise<VerifiedSubject | null>;
  /** Resolves only an explicitly reviewed Clerk-to-legacy identity link. */
  findLegacyUserIdByClerkId?: (clerkUserId: string) => Promise<string | null>;
  /** Legacy adapter retained for the staged migration window. */
  verifyLegacyToken: (token: string) => Promise<VerifiedSubject | null>;
}

export function createServerActorResolver(dependencies: ServerActorResolverDependencies) {
  return async function resolveServerActor(req: any): Promise<ServerActor | null> {
    const token = getBearerToken(req);
    if (!token) return null;

    if (dependencies.verifyClerkToken) {
      let clerkSubject: VerifiedSubject | null;
      try {
        clerkSubject = await dependencies.verifyClerkToken(token);
      } catch {
        return null;
      }

      if (clerkSubject) {
        if (!dependencies.findLegacyUserIdByClerkId) return null;
        let userId: string | null;
        try {
          userId = await dependencies.findLegacyUserIdByClerkId(clerkSubject.sub);
        } catch {
          return null;
        }
        return userId ? { userId, identityProvider: 'clerk' } : null;
      }
    }

    let legacySubject: VerifiedSubject | null;
    try {
      legacySubject = await dependencies.verifyLegacyToken(token);
    } catch {
      return null;
    }
    return legacySubject?.sub
      ? { userId: legacySubject.sub, identityProvider: 'legacy-jwt' }
      : null;
  };
}

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

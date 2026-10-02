import { createClerkClient } from '@clerk/backend';
import { query, withTransaction } from '../../db';
import { verifyClerkSessionToken } from '../../clerk-token-verifier';
import { IdentityConflictError, provisionClerkOwner } from '../../clerk-identity-service';

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export function createClerkProvisionHandler(dependencies: {
  verifyClerk: (token: string) => Promise<{ sub: string } | null>;
  findOwner: (clerkUserId: string) => Promise<{ id: string; email: string } | null>;
  getVerifiedPrimaryEmail: (clerkUserId: string) => Promise<string | null>;
  provision: (clerkUserId: string, email: string) => Promise<{ id: string; email: string }>;
}) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const subject = await dependencies.verifyClerk(token);
    if (!subject?.sub) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const owner = await dependencies.findOwner(subject.sub);
      if (owner) return res.status(200).json(owner);

      const email = await dependencies.getVerifiedPrimaryEmail(subject.sub);
      if (!email) return res.status(422).json({ error: 'Clerk requiere un correo principal verificado para crear la cuenta.' });
      const created = await dependencies.provision(subject.sub, email);
      return res.status(201).json(created);
    } catch (error) {
      if (error instanceof IdentityConflictError) return res.status(409).json({ code: error.code, error: error.message });
      console.error('Clerk account provisioning failed:', error);
      return res.status(503).json({ error: 'No se pudo completar el alta segura. Inténtalo de nuevo.' });
    }
  };
}

export const handler = createClerkProvisionHandler({
  verifyClerk: verifyClerkSessionToken,
  findOwner: async (clerkUserId) => {
    const { rows } = await query(
      `SELECT u.id, u.email FROM auth_identity_links l
       JOIN users u ON u.id = l.owner_user_id WHERE l.clerk_user_id = $1`,
      [clerkUserId],
    );
    return rows[0] || null;
  },
  getVerifiedPrimaryEmail: async (clerkUserId) => {
    if (!clerkClient) throw new Error('Clerk server configuration is unavailable.');
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.primaryEmailAddress;
    return email?.verification?.status === 'verified' ? email.emailAddress : null;
  },
  provision: (clerkUserId, email) => withTransaction((tx) => provisionClerkOwner(tx, clerkUserId, email)),
});

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

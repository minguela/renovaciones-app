import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const TOKEN_EXPIRY = '30d';

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

export function generateToken(userId: string): string {
  const secret = getJwtSecret();
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return jwt.sign({ sub: userId }, secret, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { sub: string } | null {
  const secret = getJwtSecret();
  if (!secret) return null;
  try {
    return jwt.verify(token, secret) as { sub: string };
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: any): string | null {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyToken(match[1])?.sub || null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

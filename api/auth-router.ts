type ApiHandler = (req: any, res: any) => Promise<unknown> | unknown;

export type AuthRouteHandlers = {
  google: ApiHandler;
  login: ApiHandler;
  me: ApiHandler;
  register: ApiHandler;
  linkLegacy: ApiHandler;
  provision: ApiHandler;
};

/** Dispatches the existing auth endpoints through one Vercel Function. */
export function createAuthRouter(handlers: AuthRouteHandlers): ApiHandler {
  return (req, res) => {
    const route = typeof req.query?.route === 'string' ? req.query.route : '';
    const handler = handlers[route as keyof AuthRouteHandlers];
    if (!handler) return res.status(404).json({ error: 'Not found' });
    return handler(req, res);
  };
}

import { handler as google } from '../server/auth-handlers/google';
import { handler as login } from '../server/auth-handlers/login';
import { handler as me } from '../server/auth-handlers/me';
import { handler as register } from '../server/auth-handlers/register';
import { handler as linkLegacy } from '../server/auth-handlers/clerk/link-legacy';
import { handler as provision } from '../server/auth-handlers/clerk/provision';

export default createAuthRouter({ google, login, me, register, linkLegacy, provision });

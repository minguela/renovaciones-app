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

import { handler as google } from './auth/google';
import { handler as login } from './auth/login';
import { handler as me } from './auth/me';
import { handler as register } from './auth/register';
import { handler as linkLegacy } from './auth/clerk/link-legacy';
import { handler as provision } from './auth/clerk/provision';

export default createAuthRouter({ google, login, me, register, linkLegacy, provision });

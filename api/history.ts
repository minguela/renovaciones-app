import { query } from '../server/api/db';
import { resolveServerActor } from '../server/api/legacy-actor';
import { createHistoryHandler } from '../server/api/history-handler';

const handler = createHistoryHandler({ query, getActor: resolveServerActor });
export { createHistoryHandler } from '../server/api/history-handler';
export default handler;

import { query } from './db';
import { resolveServerActor } from './legacy-actor';
import { createHistoryHandler } from './history-handler';

const handler = createHistoryHandler({ query, getActor: resolveServerActor });
export { createHistoryHandler } from './history-handler';
export default handler;

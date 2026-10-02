import { query } from './db';
import { resolveServerActor } from './legacy-actor';
import { createRenewalsGetHandler } from './renewals-get-handler';
import { createNeonRenewalRepository } from './adapters/neon-renewal-repository';
import { listRenewalsUseCase } from '../src/application/list-renewals';
import { createRenewalUseCase } from '../src/application/create-renewal';
import { updateRenewalUseCase } from '../src/application/update-renewal';
import { deleteRenewalUseCase } from '../src/application/delete-renewal';
import { createRenewalMutationsHandler } from './renewal-mutations-handler';
import { createGetAndWriteRouter } from './endpoint-router';

const renewalRepository = createNeonRenewalRepository(query);
const handleGetRenewals = createRenewalsGetHandler({
  getActor: resolveServerActor,
  listRenewals: (userId) => listRenewalsUseCase(userId, renewalRepository),
});
const handleRenewalMutations = createRenewalMutationsHandler({
  getActor: resolveServerActor,
  createRenewal: (userId, input) => createRenewalUseCase(userId, input, renewalRepository),
  updateRenewal: (userId, input) => updateRenewalUseCase(userId, input, renewalRepository),
  deleteRenewal: (userId, id) => deleteRenewalUseCase(userId, id, renewalRepository),
});
const routeRenewals = createGetAndWriteRouter(handleGetRenewals, handleRenewalMutations);

export default async function handler(req: any, res: any) {
  return routeRenewals(req, res);
}

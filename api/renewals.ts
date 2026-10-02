import { query } from '../server/api/db';
import { resolveServerActor } from '../server/api/legacy-actor';
import { createRenewalsGetHandler } from '../server/api/renewals-get-handler';
import { createNeonRenewalRepository } from '../server/api/adapters/neon-renewal-repository';
import { listRenewalsUseCase } from '../src/application/list-renewals';
import { createRenewalUseCase } from '../src/application/create-renewal';
import { updateRenewalUseCase } from '../src/application/update-renewal';
import { deleteRenewalUseCase } from '../src/application/delete-renewal';
import { createRenewalMutationsHandler } from '../server/api/renewal-mutations-handler';
import { createGetAndWriteRouter } from '../server/api/endpoint-router';

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

import { query } from './db';
import { resolveServerActor } from './legacy-actor';
import { createCatalogsGetHandler } from './catalogs-get-handler';
import { createNeonCustomCatalogRepository } from './adapters/neon-custom-catalog-repository';
import { listCustomCatalogsUseCase } from '../src/application/list-custom-catalogs';
import { createCustomCatalogUseCase } from '../src/application/create-custom-catalog';
import { updateCustomCatalogUseCase } from '../src/application/update-custom-catalog';
import { deleteCustomCatalogUseCase } from '../src/application/delete-custom-catalog';
import { createCatalogMutationsHandler } from './catalog-mutations-handler';
import { createGetAndWriteRouter } from './endpoint-router';

const customCatalogRepository = createNeonCustomCatalogRepository(query);
const handleGetCatalogs = createCatalogsGetHandler({
  getActor: resolveServerActor,
  listCatalogs: (userId) => listCustomCatalogsUseCase(userId, customCatalogRepository),
});
const handleCatalogMutations = createCatalogMutationsHandler({
  getActor: resolveServerActor,
  createCatalog: (userId, input) => createCustomCatalogUseCase(userId, input, customCatalogRepository),
  updateCatalog: (userId, id, input) => updateCustomCatalogUseCase(userId, id, input, customCatalogRepository),
  deleteCatalog: (userId, id) => deleteCustomCatalogUseCase(userId, id, customCatalogRepository),
});
const routeCatalogs = createGetAndWriteRouter(handleGetCatalogs, handleCatalogMutations);

export default async function handler(req: any, res: any) {
  return routeCatalogs(req, res);
}

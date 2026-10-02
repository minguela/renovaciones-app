import type { ServerActor } from './server-actor'
import type { CustomCatalog } from '../../src/domain/entities'

interface CatalogsGetHandlerDependencies {
  getActor: (req: any) => Promise<ServerActor | null>
  listCatalogs: (userId: string) => Promise<CustomCatalog[]>
}

export function createCatalogsGetHandler({ getActor, listCatalogs }: CatalogsGetHandlerDependencies) {
  return async function handleCatalogsGet(req: any, res: any) {
    const actor = await getActor(req)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })

    try {
      return res.json(await listCatalogs(actor.userId))
    } catch (err: any) {
      console.error('Catalogs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }
}

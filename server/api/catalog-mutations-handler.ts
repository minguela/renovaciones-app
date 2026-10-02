import type { CustomCatalog } from '../../src/domain/entities'
import type { ServerActor } from './server-actor'

interface CatalogMutationsHandlerDependencies {
  getActor: (req: any) => Promise<ServerActor | null>
  createCatalog: (userId: string, input: Record<string, any>) => Promise<CustomCatalog>
  updateCatalog: (userId: string, id: string, input: Record<string, any>) => Promise<CustomCatalog | null>
  deleteCatalog: (userId: string, id: string) => Promise<boolean>
}

/** HTTP adapter for legacy authenticated catalog mutations. */
export function createCatalogMutationsHandler({
  getActor,
  createCatalog,
  updateCatalog,
  deleteCatalog,
}: CatalogMutationsHandlerDependencies) {
  return async function handleCatalogMutations(req: any, res: any) {
    const actor = await getActor(req)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })
    const userId = actor.userId

    try {
      if (req.method === 'POST') {
        return res.status(201).json(await createCatalog(userId, req.body))
      }

      if (req.method === 'PUT') {
        const catalog = req.body
        const result = await updateCatalog(userId, catalog.id, catalog)
        if (!result) return res.status(404).json({ error: 'Not found' })
        return res.json(result)
      }

      if (req.method === 'DELETE') {
        const { id } = req.body || req.query || {}
        if (!await deleteCatalog(userId, id)) return res.status(404).json({ error: 'Not found' })
        return res.json({ success: true })
      }

      return res.status(405).json({ error: 'Method not allowed' })
    } catch (err: any) {
      console.error('Catalogs error:', err)
      return res.status(500).json({ error: err.message })
    }
  }
}

import type { RenewalListItem } from '../../src/domain/entities'
import type { ServerActor } from './server-actor'

interface RenewalMutationsHandlerDependencies {
  getActor: (req: any) => Promise<ServerActor | null>
  createRenewal: (userId: string, input: Record<string, any>) => Promise<RenewalListItem>
  updateRenewal: (userId: string, input: Record<string, any>) => Promise<RenewalListItem | null>
  deleteRenewal: (userId: string, id: string) => Promise<boolean>
}

/** HTTP adapter for legacy authenticated renewal mutations. */
export function createRenewalMutationsHandler({
  getActor,
  createRenewal,
  updateRenewal,
  deleteRenewal,
}: RenewalMutationsHandlerDependencies) {
  return async function handleRenewalMutations(req: any, res: any) {
    const actor = await getActor(req)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })
    const userId = actor.userId

    try {
      switch (req.method) {
        case 'POST':
          return res.status(201).json(await createRenewal(userId, req.body))
        case 'PUT': {
          const renewal = await updateRenewal(userId, req.body)
          if (!renewal) return res.status(404).json({ error: 'Not found' })
          return res.json(renewal)
        }
        case 'DELETE': {
          const { id } = req.body || req.query || {}
          if (!await deleteRenewal(userId, id)) return res.status(404).json({ error: 'Not found' })
          return res.json({ success: true })
        }
        default:
          return res.status(405).json({ error: 'Method not allowed' })
      }
    } catch (err: any) {
      console.error('Renewals error:', err)
      return res.status(500).json({ error: err.message })
    }
  }
}

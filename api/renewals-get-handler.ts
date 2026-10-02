import type { ServerActor } from './server-actor'
import type { RenewalListItem } from '../src/domain/entities'

interface RenewalsGetHandlerDependencies {
  getActor: (req: any) => Promise<ServerActor | null>
  listRenewals: (userId: string) => Promise<RenewalListItem[]>
}

export function createRenewalsGetHandler({ getActor, listRenewals }: RenewalsGetHandlerDependencies) {
  return async function handleRenewalsGet(req: any, res: any) {
    const actor = await getActor(req)
    if (!actor) return res.status(401).json({ error: 'Unauthorized' })

    try {
      return res.json(await listRenewals(actor.userId))
    } catch (err: any) {
      console.error('Renewals error:', err)
      return res.status(500).json({ error: err.message })
    }
  }
}

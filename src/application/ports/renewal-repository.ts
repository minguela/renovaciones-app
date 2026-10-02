import type { RenewalListItem } from '../../domain/entities'

/** Server persistence boundary for the existing renewal list read model. */
export interface RenewalRepository {
  listForUser(userId: string): Promise<RenewalListItem[]>
  createForUser(userId: string, input: Record<string, any>): Promise<RenewalListItem>
  updateForUser(userId: string, input: Record<string, any>): Promise<RenewalListItem | null>
  deleteForUser(userId: string, id: string): Promise<boolean>
}

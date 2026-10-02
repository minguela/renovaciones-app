import type { RenewalListItem } from '../domain/entities'
import type { RenewalRepository } from './ports/renewal-repository'

export async function listRenewalsUseCase(
  userId: string,
  repository: RenewalRepository,
): Promise<RenewalListItem[]> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.listForUser(userId)
}

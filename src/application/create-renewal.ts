import type { RenewalListItem } from '../domain/entities'
import type { RenewalRepository } from './ports/renewal-repository'

export async function createRenewalUseCase(
  userId: string,
  input: Record<string, any>,
  repository: RenewalRepository,
): Promise<RenewalListItem> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.createForUser(userId, input)
}

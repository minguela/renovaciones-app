import type { RenewalRepository } from './ports/renewal-repository'

export async function deleteRenewalUseCase(
  userId: string,
  id: string,
  repository: RenewalRepository,
): Promise<boolean> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.deleteForUser(userId, id)
}

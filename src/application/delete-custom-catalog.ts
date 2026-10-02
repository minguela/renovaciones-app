import type { CustomCatalogRepository } from './ports/custom-catalog-repository'

export async function deleteCustomCatalogUseCase(
  userId: string,
  id: string,
  repository: CustomCatalogRepository,
): Promise<boolean> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.deleteForUser(userId, id)
}

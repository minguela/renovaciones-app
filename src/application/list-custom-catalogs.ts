import type { CustomCatalog } from '../domain/entities'
import type { CustomCatalogRepository } from './ports/custom-catalog-repository'

export async function listCustomCatalogsUseCase(
  userId: string,
  repository: CustomCatalogRepository,
): Promise<CustomCatalog[]> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.listForUser(userId)
}

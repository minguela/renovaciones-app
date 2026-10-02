import type { CustomCatalog } from '../domain/entities'
import type { CustomCatalogRepository } from './ports/custom-catalog-repository'

export async function updateCustomCatalogUseCase(
  userId: string,
  id: string,
  input: Record<string, any>,
  repository: CustomCatalogRepository,
): Promise<CustomCatalog | null> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.updateForUser(userId, id, input)
}

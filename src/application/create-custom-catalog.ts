import type { CustomCatalog } from '../domain/entities'
import type { CustomCatalogRepository } from './ports/custom-catalog-repository'

export async function createCustomCatalogUseCase(
  userId: string,
  input: Record<string, any>,
  repository: CustomCatalogRepository,
): Promise<CustomCatalog> {
  if (!userId.trim()) throw new Error('Authenticated user is required')
  return repository.createForUser(userId, input)
}

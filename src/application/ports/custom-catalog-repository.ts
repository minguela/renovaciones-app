import type { CustomCatalog } from '../../domain/entities'

/** Persistence boundary for user-owned custom catalogs. */
export interface CustomCatalogRepository {
  listForUser(userId: string): Promise<CustomCatalog[]>
  createForUser(userId: string, input: Record<string, any>): Promise<CustomCatalog>
  updateForUser(userId: string, id: string, input: Record<string, any>): Promise<CustomCatalog | null>
  deleteForUser(userId: string, id: string): Promise<boolean>
}

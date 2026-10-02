import type { CustomCatalogRepository } from '../../src/application/ports/custom-catalog-repository'
import type { CustomCatalog } from '../../src/domain/entities'

interface CatalogRow {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  options: string | unknown[] | null
  created_at: string | Date
  updated_at: string | Date
}

interface QueryResult {
  rows: CatalogRow[]
  rowCount?: number | null
}

type Query = (sql: string, params?: unknown[]) => Promise<QueryResult>

/** Server-side Neon adapter. Compose it only from API/server code. */
export function createNeonCustomCatalogRepository(query: Query): CustomCatalogRepository {
  return {
    async listForUser(userId) {
      const { rows } = await query(
        'SELECT * FROM user_catalogs WHERE user_id = $1 ORDER BY created_at ASC',
        [userId],
      )

      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        icon: row.icon || 'tag.fill',
        color: row.color || '#007AFF',
        options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      }))
    },

    async createForUser(userId, input) {
      const { rows } = await query(
        `INSERT INTO user_catalogs (user_id, name, icon, color, options)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [userId, input.name, input.icon || 'tag.fill', input.color || '#007AFF', JSON.stringify(input.options || [])],
      )
      return mapCatalog(rows[0], false)
    },

    async updateForUser(userId, id, input) {
      const { rows } = await query(
        `UPDATE user_catalogs SET name = $3, icon = $4, color = $5, options = $6, updated_at = now()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId, input.name, input.icon, input.color, JSON.stringify(input.options || [])],
      )
      return rows.length === 0 ? null : mapCatalog(rows[0], false)
    },

    async deleteForUser(userId, id) {
      const { rowCount } = await query(
        'DELETE FROM user_catalogs WHERE id = $1 AND user_id = $2',
        [id, userId],
      )
      return rowCount !== 0
    },
  }
}

function mapCatalog(row: CatalogRow, useReadDefaults = true): CustomCatalog {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: (useReadDefaults ? row.icon || 'tag.fill' : row.icon) as string,
    color: (useReadDefaults ? row.color || '#007AFF' : row.color) as string,
    options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  }
}

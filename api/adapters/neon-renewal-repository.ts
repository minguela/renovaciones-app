import type { RenewalListItem } from '../../src/domain/entities'
import type { RenewalRepository } from '../../src/application/ports/renewal-repository'

interface RenewalRow {
  id: string
  user_id: string
  name: string
  type: string
  frequency: string
  cost: number | string
  currency: string
  renewal_date: string | Date
  provider: string | null
  notes: string | null
  color: string | null
  icon: string | null
  notification_enabled: boolean
  notification_days_before: number
  status: string
  payment_method: string | null
  bank_account: string | null
  tags: string | unknown[] | null
  auto_renew: boolean
  contract_end_date: string | Date | null
  attachments: string | unknown[] | null
  created_at: string | Date
  updated_at: string | Date
}

interface QueryResult {
  rows: RenewalRow[]
  rowCount?: number | null
}

type Query = (sql: string, params?: unknown[]) => Promise<QueryResult>

/** Server-side Neon adapter; ownership is always constrained to the actor ID. */
export function createNeonRenewalRepository(query: Query): RenewalRepository {
  return {
    async listForUser(userId) {
      const { rows } = await query(
        'SELECT * FROM renewals WHERE user_id = $1 ORDER BY renewal_date ASC',
        [userId],
      )
      return rows.map(mapRenewal)
    },

    async createForUser(userId, input) {
      const { rows } = await query(
        `INSERT INTO renewals (
          id, user_id, name, type, frequency, cost, currency, renewal_date,
          provider, notes, color, icon, notification_enabled, notification_days_before,
          status, payment_method, bank_account, tags, auto_renew, contract_end_date, attachments
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        RETURNING *`,
        renewalParams(userId, input),
      )
      return mapRenewal(rows[0])
    },

    async updateForUser(userId, input) {
      const { rows } = await query(
        `UPDATE renewals SET
          name = $3, type = $4, frequency = $5, cost = $6, currency = $7,
          renewal_date = $8, provider = $9, notes = $10, color = $11, icon = $12,
          notification_enabled = $13, notification_days_before = $14,
          status = $15, payment_method = $16, bank_account = $17,
          tags = $18, auto_renew = $19, contract_end_date = $20,
          attachments = $21, updated_at = now()
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
        [input.id, userId, ...renewalParams(userId, input).slice(2)],
      )
      return rows.length === 0 ? null : mapRenewal(rows[0])
    },

    async deleteForUser(userId, id) {
      const { rowCount } = await query(
        'DELETE FROM renewals WHERE id = $1 AND user_id = $2',
        [id, userId],
      )
      return rowCount !== 0
    },
  }
}

function renewalParams(userId: string, r: Record<string, any>): unknown[] {
  return [
    r.id, userId, r.name, r.type || 'other', r.frequency || 'monthly',
    r.cost || 0, r.currency || 'EUR', r.renewalDate,
    r.provider || null, r.notes || null, r.color || null, r.icon || null,
    r.notificationEnabled !== false, r.notificationDaysBefore || 7,
    r.status || 'active', r.paymentMethod || null, r.bankAccount || null,
    JSON.stringify(r.tags || []), r.autoRenew || false,
    r.contractEndDate || null, JSON.stringify(r.attachments || []),
  ]
}

function mapRenewal(row: RenewalRow): RenewalListItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    frequency: row.frequency,
    cost: Number(row.cost),
    currency: row.currency,
    renewalDate: row.renewal_date,
    provider: row.provider,
    notes: row.notes,
    color: row.color,
    icon: row.icon,
    notificationEnabled: row.notification_enabled,
    notificationDaysBefore: row.notification_days_before,
    status: row.status,
    paymentMethod: row.payment_method,
    bankAccount: row.bank_account,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    autoRenew: row.auto_renew,
    contractEndDate: row.contract_end_date,
    attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

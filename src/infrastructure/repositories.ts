// Infrastructure — Repositories for external data access
// These wrap the existing api/ layer

import type { Renewal, Catalog } from '../domain/entities'

// Re-exports from existing API layer for now — eventual target is direct DB access
const apiClient = {
  get: async <T>(url: string) => { const r = await fetch(url); return r.json() as T },
  post: async <T>(url: string, body: unknown) => { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return r.json() as T },
  put: async <T>(url: string, body: unknown) => { const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return r.json() as T },
  delete: async (url: string) => { await fetch(url, { method: 'DELETE' }) },
}

export const renewalRepository = {
  listAll: () => apiClient.get<Renewal[]>('/api/renewals'),
  getById: (id: string) => apiClient.get<Renewal>(`/api/renewals/${id}`),
  create: (data: Partial<Renewal>) => apiClient.post<Renewal>('/api/renewals', data),
  update: (id: string, data: Partial<Renewal>) => apiClient.put<Renewal>(`/api/renewals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/renewals/${id}`),
  checkExpiring: () => apiClient.get<Renewal[]>('/api/check-renewals'),
}

export const catalogRepository = {
  listAll: () => apiClient.get<Catalog[]>('/api/catalogs'),
}

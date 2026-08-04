// Application — Use cases for Renewal management
// These express intent and orchestrate domain + infrastructure

import type { Renewal, Catalog } from '../domain/entities'
import { renewalRepository, catalogRepository } from '../infrastructure/repositories'

export async function listRenewalsUseCase(): Promise<Renewal[]> {
  return renewalRepository.listAll()
}

export async function getRenewalUseCase(id: string): Promise<Renewal> {
  return renewalRepository.getById(id)
}

export async function createRenewalUseCase(data: Partial<Renewal>): Promise<Renewal> {
  return renewalRepository.create(data)
}

export async function updateRenewalUseCase(id: string, data: Partial<Renewal>): Promise<Renewal> {
  return renewalRepository.update(id, data)
}

export async function deleteRenewalUseCase(id: string): Promise<void> {
  return renewalRepository.delete(id)
}

export async function checkExpiringRenewalsUseCase(): Promise<Renewal[]> {
  return renewalRepository.checkExpiring()
}

export async function listCatalogsUseCase(): Promise<Catalog[]> {
  return catalogRepository.listAll()
}

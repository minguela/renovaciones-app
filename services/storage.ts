// Almacenamiento en memoria para Expo Go (compatible con New Architecture)
import type { Renewal } from '@/types/renewal';

// Memoria temporal - los datos se pierden al cerrar la app
// Para persistencia real en iOS nativo, usarías CoreData o UserDefaults
let memoryStorage: Renewal[] = [];

export async function getRenewals(): Promise<Renewal[]> {
  return [...memoryStorage];
}

export async function saveRenewals(renewals: Renewal[]): Promise<void> {
  memoryStorage = [...renewals];
}

export async function addRenewal(renewal: Renewal): Promise<void> {
  memoryStorage.push(renewal);
}

export async function updateRenewal(updatedRenewal: Renewal): Promise<void> {
  const index = memoryStorage.findIndex(r => r.id === updatedRenewal.id);
  if (index !== -1) {
    memoryStorage[index] = updatedRenewal;
  }
}

export async function deleteRenewal(id: string): Promise<void> {
  memoryStorage = memoryStorage.filter(r => r.id !== id);
}

export async function getRenewalById(id: string): Promise<Renewal | null> {
  return memoryStorage.find(r => r.id === id) || null;
}

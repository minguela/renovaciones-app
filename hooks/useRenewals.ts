import { useState, useEffect, useCallback } from 'react';
import type { Renewal } from '@/types/renewal';
import type { RenewalHistory } from '@/types/renewal';
import {
  getRenewals as apiGetRenewals,
  addRenewal as apiAddRenewal,
  updateRenewal as apiUpdateRenewal,
  deleteRenewal as apiDeleteRenewal,
  getRenewalHistory,
  addRenewalHistory,
} from '@/lib/api-client';

export function useRenewals(userId?: string | null) {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRenewals = useCallback(async () => {
    if (!userId) {
      setRenewals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiGetRenewals();
      setRenewals(data);
    } catch (err) {
      setError('Error al cargar las renovaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRenewals();
  }, [loadRenewals]);

  const addRenewal = useCallback(async (renewal: Renewal) => {
    if (!userId) return false;
    try {
      const { error } = await apiAddRenewal(renewal);
      if (error) throw error;
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al añadir la renovación');
      console.error(err);
      return false;
    }
  }, [userId, loadRenewals]);

  const updateRenewal = useCallback(async (renewal: Renewal, previousRenewal?: Renewal) => {
    if (!userId) return false;
    try {
      if (previousRenewal) {
        const costChanged = previousRenewal.cost !== renewal.cost;
        const frequencyChanged = previousRenewal.frequency !== renewal.frequency;
        if (costChanged || frequencyChanged) {
          await addRenewalHistory({
            renewalId: renewal.id,
            oldCost: previousRenewal.cost,
            newCost: renewal.cost,
            oldFrequency: previousRenewal.frequency,
            newFrequency: renewal.frequency,
          });
        }
      }
      const { error } = await apiUpdateRenewal(renewal);
      if (error) throw error;
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al actualizar la renovación');
      console.error(err);
      return false;
    }
  }, [userId, loadRenewals]);

  const deleteRenewal = useCallback(async (id: string) => {
    if (!userId) return false;
    try {
      const { error } = await apiDeleteRenewal(id);
      if (error) throw error;
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al eliminar la renovación');
      console.error(err);
      return false;
    }
  }, [userId, loadRenewals]);

  const getRenewalById = useCallback(async (id: string) => {
    return renewals.find(r => r.id === id) || null;
  }, [renewals]);

  const getHistoryForRenewal = useCallback(async (renewalId: string): Promise<RenewalHistory[]> => {
    try {
      return await getRenewalHistory(renewalId);
    } catch (err) {
      console.error('Error loading renewal history:', err);
      return [];
    }
  }, []);

  return {
    renewals,
    loading,
    error,
    addRenewal,
    updateRenewal,
    deleteRenewal,
    getRenewalById,
    getHistoryForRenewal,
    refresh: loadRenewals,
    isAuthenticated: !!userId,
  };
}

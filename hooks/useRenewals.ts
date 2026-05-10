import { useState, useEffect, useCallback } from 'react';
import type { Renewal } from '@/types/renewal';
import * as storage from '@/services/storage';
import * as notifications from '@/services/notifications';

export function useRenewals() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRenewals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getRenewals();
      // Sort by renewal date
      const sorted = data.sort((a, b) => 
        new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
      );
      setRenewals(sorted);
    } catch (err) {
      setError('Error al cargar las renovaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRenewals();
  }, [loadRenewals]);

  const addRenewal = useCallback(async (renewal: Renewal) => {
    try {
      await storage.addRenewal(renewal);
      if (renewal.notificationEnabled) {
        await notifications.scheduleRenewalNotification(renewal);
      }
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al añadir la renovación');
      console.error(err);
      return false;
    }
  }, [loadRenewals]);

  const updateRenewal = useCallback(async (renewal: Renewal) => {
    try {
      await storage.updateRenewal(renewal);
      if (renewal.notificationEnabled) {
        await notifications.scheduleRenewalNotification(renewal);
      } else {
        await notifications.cancelRenewalNotification(renewal.id);
      }
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al actualizar la renovación');
      console.error(err);
      return false;
    }
  }, [loadRenewals]);

  const deleteRenewal = useCallback(async (id: string) => {
    try {
      await notifications.cancelRenewalNotification(id);
      await storage.deleteRenewal(id);
      await loadRenewals();
      return true;
    } catch (err) {
      setError('Error al eliminar la renovación');
      console.error(err);
      return false;
    }
  }, [loadRenewals]);

  const getRenewalById = useCallback(async (id: string) => {
    return await storage.getRenewalById(id);
  }, []);

  return {
    renewals,
    loading,
    error,
    addRenewal,
    updateRenewal,
    deleteRenewal,
    getRenewalById,
    refresh: loadRenewals,
  };
}

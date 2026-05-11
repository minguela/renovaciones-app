import { useState, useEffect, useCallback } from 'react';
import type { Renewal, RenewalHistory } from '@/types/renewal';
import { supabase, getCurrentUser, getRenewalHistory, addRenewalHistory } from '@/lib/supabase';

export function useRenewals() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const loadRenewals = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('renewals')
        .select('*')
        .eq('user_id', userId)
        .order('renewal_date', { ascending: true });

      if (supabaseError) throw supabaseError;

      // Map database fields to app types
      const mappedRenewals: Renewal[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        frequency: item.frequency,
        cost: item.cost,
        currency: item.currency,
        renewalDate: item.renewal_date,
        provider: item.provider,
        notes: item.notes,
        color: item.color,
        icon: item.icon,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        notificationEnabled: item.notification_enabled,
        notificationDaysBefore: item.notification_days_before,
        status: item.status,
        paymentMethod: item.payment_method,
        bankAccount: item.bank_account,
        tags: item.tags || [],
        autoRenew: item.auto_renew,
        contractEndDate: item.contract_end_date,
        attachments: item.attachments || [],
      }));

      setRenewals(mappedRenewals);
    } catch (err) {
      setError('Error al cargar las renovaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadRenewals();
    }
  }, [userId, loadRenewals]);

  const addRenewal = useCallback(async (renewal: Renewal) => {
    if (!userId) return false;

    try {
      const { error: supabaseError } = await supabase
        .from('renewals')
        .insert([{
          id: renewal.id,
          user_id: userId,
          name: renewal.name,
          type: renewal.type,
          frequency: renewal.frequency,
          cost: renewal.cost,
          currency: renewal.currency,
          renewal_date: renewal.renewalDate,
          provider: renewal.provider,
          notes: renewal.notes,
          color: renewal.color,
          icon: renewal.icon,
          notification_enabled: renewal.notificationEnabled,
          notification_days_before: renewal.notificationDaysBefore,
          status: renewal.status,
          payment_method: renewal.paymentMethod,
          bank_account: renewal.bankAccount,
          tags: renewal.tags,
          auto_renew: renewal.autoRenew,
          contract_end_date: renewal.contractEndDate,
          attachments: renewal.attachments || [],
        }]);

      if (supabaseError) throw supabaseError;

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
      // If cost or frequency changed, save history
      if (previousRenewal) {
        const costChanged = previousRenewal.cost !== renewal.cost;
        const frequencyChanged = previousRenewal.frequency !== renewal.frequency;
        if (costChanged || frequencyChanged) {
          const { error: historyError } = await addRenewalHistory({
            renewalId: renewal.id,
            oldCost: previousRenewal.cost,
            newCost: renewal.cost,
            oldFrequency: previousRenewal.frequency,
            newFrequency: renewal.frequency,
          });
          if (historyError) {
            console.error('Error saving renewal history:', historyError);
          }
        }
      }

      const { error: supabaseError } = await supabase
        .from('renewals')
        .update({
          name: renewal.name,
          type: renewal.type,
          frequency: renewal.frequency,
          cost: renewal.cost,
          currency: renewal.currency,
          renewal_date: renewal.renewalDate,
          provider: renewal.provider,
          notes: renewal.notes,
          color: renewal.color,
          icon: renewal.icon,
          notification_enabled: renewal.notificationEnabled,
          notification_days_before: renewal.notificationDaysBefore,
          status: renewal.status,
          payment_method: renewal.paymentMethod,
          bank_account: renewal.bankAccount,
          tags: renewal.tags,
          auto_renew: renewal.autoRenew,
          contract_end_date: renewal.contractEndDate,
          attachments: renewal.attachments || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', renewal.id)
        .eq('user_id', userId);

      if (supabaseError) throw supabaseError;

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
      const { error: supabaseError } = await supabase
        .from('renewals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (supabaseError) throw supabaseError;

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

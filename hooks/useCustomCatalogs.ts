import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CatalogCategory, CatalogOption } from '@/types/catalog';

export interface UserCatalog {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  options: CatalogOption[];
  created_at: string;
  updated_at: string;
}

export function useCustomCatalogs(userId?: string | null) {
  const [catalogs, setCatalogs] = useState<UserCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    if (!userId) {
      setCatalogs([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('user_catalogs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (supabaseError) throw supabaseError;

      const mapped: UserCatalog[] = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        icon: item.icon || 'tag.fill',
        color: item.color || '#007AFF',
        options: Array.isArray(item.options) ? item.options : JSON.parse(item.options || '[]'),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setCatalogs(mapped);
    } catch (err) {
      setError('Error al cargar catálogos personalizados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  const addCatalog = useCallback(async (catalog: Omit<UserCatalog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    try {
      const { data, error: supabaseError } = await supabase
        .from('user_catalogs')
        .insert([{
          user_id: userId,
          name: catalog.name,
          icon: catalog.icon,
          color: catalog.color,
          options: catalog.options,
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      await loadCatalogs();
      return data;
    } catch (err) {
      setError('Error al crear catálogo');
      console.error(err);
      return null;
    }
  }, [userId, loadCatalogs]);

  const updateCatalog = useCallback(async (id: string, updates: Partial<Omit<UserCatalog, 'id' | 'user_id'>>) => {
    if (!userId) return false;
    try {
      const { error: supabaseError } = await supabase
        .from('user_catalogs')
        .update({
          name: updates.name,
          icon: updates.icon,
          color: updates.color,
          options: updates.options,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (supabaseError) throw supabaseError;
      await loadCatalogs();
      return true;
    } catch (err) {
      setError('Error al actualizar catálogo');
      console.error(err);
      return false;
    }
  }, [userId, loadCatalogs]);

  const deleteCatalog = useCallback(async (id: string) => {
    if (!userId) return false;
    try {
      const { error: supabaseError } = await supabase
        .from('user_catalogs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (supabaseError) throw supabaseError;
      await loadCatalogs();
      return true;
    } catch (err) {
      setError('Error al eliminar catálogo');
      console.error(err);
      return false;
    }
  }, [userId, loadCatalogs]);

  return {
    catalogs,
    loading,
    error,
    addCatalog,
    updateCatalog,
    deleteCatalog,
    refresh: loadCatalogs,
  };
}

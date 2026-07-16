import { useState, useEffect, useCallback } from 'react';
import { CatalogOption } from '@/types/catalog';
import {
  getCatalogs,
  addCatalog,
  updateCatalog,
  deleteCatalog,
  type UserCatalog,
} from '@/lib/api-client';

export type { UserCatalog };

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
      const data = await getCatalogs();
      setCatalogs(data);
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

  const addCatalogFn = useCallback(async (catalog: Omit<UserCatalog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return null;
    try {
      const { data, error: apiError } = await addCatalog(catalog);
      if (apiError) throw apiError;
      await loadCatalogs();
      return data;
    } catch (err) {
      setError('Error al crear catálogo');
      console.error(err);
      return null;
    }
  }, [userId, loadCatalogs]);

  const updateCatalogFn = useCallback(async (id: string, updates: Partial<Omit<UserCatalog, 'id' | 'userId'>>) => {
    if (!userId) return false;
    try {
      const { error: apiError } = await updateCatalog(id, updates);
      if (apiError) throw apiError;
      await loadCatalogs();
      return true;
    } catch (err) {
      setError('Error al actualizar catálogo');
      console.error(err);
      return false;
    }
  }, [userId, loadCatalogs]);

  const deleteCatalogFn = useCallback(async (id: string) => {
    if (!userId) return false;
    try {
      const { error: apiError } = await deleteCatalog(id);
      if (apiError) throw apiError;
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
    addCatalog: addCatalogFn,
    updateCatalog: updateCatalogFn,
    deleteCatalog: deleteCatalogFn,
    refresh: loadCatalogs,
  };
}

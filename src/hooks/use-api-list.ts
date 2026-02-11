import { useState, useEffect, useCallback } from 'react';
import { useApi } from './use-api';

interface UseApiListOptions<T> {
  endpoint: string;
  initialFilters?: Record<string, any>;
  autoFetch?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: string) => void;
}

export function useApiList<T = any>(options: UseApiListOptions<T>) {
  const {
    endpoint,
    initialFilters = {},
    autoFetch = true,
    onSuccess,
    onError,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const { execute, isLoading, error } = useApi<T[]>({
    onSuccess: (data) => {
      setItems(data);
      onSuccess?.(data);
    },
    onError,
    showSuccessToast: false,
  });

  const fetchItems = useCallback(async () => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await execute(url, 'GET');
  }, [endpoint, filters, execute]);

  const createItem = useCallback(async (data: Partial<T>) => {
    const newItem = await execute(endpoint, 'POST', data);
    await fetchItems();
    return newItem;
  }, [endpoint, execute, fetchItems]);

  const updateItem = useCallback(async (id: string, data: Partial<T>) => {
    const updatedItem = await execute(`${endpoint}/${id}`, 'PATCH', data);
    await fetchItems();
    return updatedItem;
  }, [endpoint, execute, fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    await execute(`${endpoint}/${id}`, 'DELETE');
    await fetchItems();
  }, [endpoint, execute, fetchItems]);

  const refresh = useCallback(() => {
    return fetchItems();
  }, [fetchItems]);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, filters, autoFetch]);

  return {
    items,
    isLoading,
    error,
    filters,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    refresh,
    updateFilters,
    clearFilters,
  };
}

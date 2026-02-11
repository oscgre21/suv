import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        ...(body && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const responseData = method === 'DELETE'
        ? { success: true }
        : await response.json();

      setData(responseData);

      if (options?.onSuccess) {
        options.onSuccess(responseData);
      }

      if (options?.showSuccessToast !== false && method !== 'GET') {
        const messages = {
          POST: 'Registro creado exitosamente',
          PATCH: 'Registro actualizado exitosamente',
          DELETE: 'Registro eliminado exitosamente',
        };

        toast({
          title: '✅ Éxito',
          description: messages[method as keyof typeof messages],
        });
      }

      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);

      if (options?.showErrorToast !== false) {
        toast({
          title: '⚠️ Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      if (options?.onError) {
        options.onError(errorMessage);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

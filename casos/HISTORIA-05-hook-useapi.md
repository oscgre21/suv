# Historia 05: Hook useApi y API Base

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03
**Estimación:** 1-2 horas
**Estado:** Pendiente

---

## Objetivo

Crear un hook personalizado `useApi` para gestionar todas las peticiones HTTP a las API Routes del sistema, con manejo centralizado de errores, estados de carga, y notificaciones toast. Este hook será utilizado por todos los componentes CRUD del frontend.

---

## Pre-requisitos

- ✅ Prisma instalado y configurado (Historia 01)
- ✅ Schemas Zod creados (Historia 03)
- ✅ Componentes shadcn/ui disponibles (toast, button, etc)
- ✅ React Hook Form + Zod instalados

---

## Tareas Detalladas

### 1. Crear Hook useApi

**Archivo:** `src/hooks/use-api.ts`

```typescript
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (
    url: string,
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    body?: any,
    overrideOptions?: Partial<UseApiOptions<T>>
  ) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(options?: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const execute = useCallback(
    async (
      url: string,
      method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
      body?: any,
      overrideOptions?: Partial<UseApiOptions<T>>
    ): Promise<T> => {
      const finalOptions = { ...options, ...overrideOptions };
      const {
        onSuccess,
        onError,
        successMessage,
        errorMessage,
        showSuccessToast = true,
        showErrorToast = true,
      } = finalOptions;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method,
          ...(body && {
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || errorMessage || 'Error en la solicitud');
        }

        setData(responseData);

        // Toast de éxito
        if (showSuccessToast && (successMessage || method !== 'GET')) {
          const defaultSuccessMessage = {
            POST: 'Registro creado exitosamente',
            PATCH: 'Registro actualizado exitosamente',
            DELETE: 'Registro eliminado exitosamente',
            GET: '',
          };

          toast({
            title: '✅ Operación exitosa',
            description: successMessage || defaultSuccessMessage[method],
            variant: 'default',
          });
        }

        // Callback de éxito
        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (err: any) {
        const errorMsg = err.message || errorMessage || 'Error desconocido';
        setError(errorMsg);

        // Toast de error
        if (showErrorToast) {
          toast({
            title: '⚠️ Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }

        // Callback de error
        if (onError) {
          onError(errorMsg);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options, toast]
  );

  return { data, isLoading, error, execute, reset };
}
```

**Explicación del Hook:**

1. **Estados manejados:**
   - `data`: Datos de la respuesta
   - `isLoading`: Estado de carga
   - `error`: Mensaje de error si ocurre

2. **Opciones configurables:**
   - `onSuccess`: Callback ejecutado en éxito
   - `onError`: Callback ejecutado en error
   - `successMessage`: Mensaje personalizado de éxito
   - `errorMessage`: Mensaje personalizado de error
   - `showSuccessToast`: Mostrar/ocultar toast de éxito
   - `showErrorToast`: Mostrar/ocultar toast de error

3. **Método execute:**
   - Soporta GET, POST, PATCH, DELETE
   - Manejo automático de JSON
   - Toasts automáticos según método HTTP
   - Permite override de opciones por llamada

4. **Método reset:**
   - Limpia estado (útil al cerrar modales)

---

### 2. Crear Helper de Utilidades API

**Archivo:** `src/lib/api-utils.ts`

```typescript
/**
 * Construye query params para URLs
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Manejo de errores de Prisma
 */
export function handlePrismaError(error: any): string {
  if (error.code === 'P2002') {
    const target = error.meta?.target || [];
    return `Ya existe un registro con este ${target.join(', ')}`;
  }

  if (error.code === 'P2025') {
    return 'Registro no encontrado';
  }

  if (error.code === 'P2003') {
    return 'No se puede eliminar porque tiene registros relacionados';
  }

  if (error.code === 'P2014') {
    return 'La relación con otro registro es inválida';
  }

  return 'Error en la base de datos';
}

/**
 * Validación de respuesta de API
 */
export function validateApiResponse<T>(data: any, expectedFields: string[]): T {
  const missingFields = expectedFields.filter((field) => !(field in data));

  if (missingFields.length > 0) {
    throw new Error(`Respuesta inválida: faltan campos ${missingFields.join(', ')}`);
  }

  return data as T;
}

/**
 * Retry de peticiones con backoff exponencial
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  initialDelay = 1000
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      // Si es un error de servidor (5xx), reintentar
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      if (i < maxRetries - 1) {
        // Backoff exponencial: 1s, 2s, 4s
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Debounce para búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
```

---

### 3. Crear Hook useDebounce

**Archivo:** `src/hooks/use-debounce.ts`

```typescript
import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores (útil para búsquedas)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 4. Crear Hook useApiList

**Archivo:** `src/hooks/use-api-list.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './use-api';
import { buildQueryParams } from '@/lib/api-utils';

interface UseApiListOptions<T> {
  url: string;
  autoFetch?: boolean;
  initialFilters?: Record<string, any>;
}

interface UseApiListReturn<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  refresh: () => Promise<void>;
  create: (item: Partial<T>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function useApiList<T extends { id: string }>(
  options: UseApiListOptions<T>
): UseApiListReturn<T> {
  const { url, autoFetch = true, initialFilters = {} } = options;
  const [items, setItems] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const { execute, isLoading, error } = useApi<T[]>({
    showSuccessToast: false,
  });

  const { execute: executeCreate } = useApi<T>({
    successMessage: 'Registro creado exitosamente',
  });

  const { execute: executeUpdate } = useApi<T>({
    successMessage: 'Registro actualizado exitosamente',
  });

  const { execute: executeDelete } = useApi<void>({
    successMessage: 'Registro eliminado exitosamente',
  });

  const refresh = useCallback(async () => {
    try {
      const queryParams = buildQueryParams(filters);
      const data = await execute(`${url}${queryParams}`, 'GET');
      setItems(data);
    } catch (error) {
      console.error('Error refreshing list:', error);
    }
  }, [url, filters, execute]);

  const create = useCallback(
    async (item: Partial<T>): Promise<T> => {
      const newItem = await executeCreate(url, 'POST', item);
      await refresh();
      return newItem;
    },
    [url, executeCreate, refresh]
  );

  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<T> => {
      const updatedItem = await executeUpdate(`${url}/${id}`, 'PATCH', item);
      await refresh();
      return updatedItem;
    },
    [url, executeUpdate, refresh]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await executeDelete(`${url}/${id}`, 'DELETE');
      await refresh();
    },
    [url, executeDelete, refresh]
  );

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
    items,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    create,
    update,
    remove,
  };
}
```

**Explicación del Hook useApiList:**

Este hook simplifica el manejo de listas CRUD:
- Auto-fetch al montar componente
- Refresh automático después de operaciones CRUD
- Filtros reactivos
- Métodos create, update, remove integrados

---

## Pruebas de Verificación

### Test 1: useApi Básico

**Crear archivo de prueba:** `test-useapi.tsx`

```typescript
'use client';

import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';

export default function TestUseApi() {
  const { data, isLoading, error, execute } = useApi({
    successMessage: 'Datos cargados correctamente',
  });

  const handleFetch = async () => {
    try {
      await execute('/api/conductores', 'GET');
      console.log('✅ Datos obtenidos:', data);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  };

  return (
    <div className="p-6">
      <Button onClick={handleFetch} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Cargar Conductores'}
      </Button>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {data && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

### Test 2: useApiList CRUD Completo

```typescript
'use client';

import { useApiList } from '@/hooks/use-api-list';
import { Button } from '@/components/ui/button';

export default function TestUseApiList() {
  const { items, isLoading, create, update, remove, refresh } = useApiList({
    url: '/api/conductores',
    autoFetch: true,
  });

  const handleCreate = async () => {
    await create({
      nombre: 'Test Conductor',
      cedula: '001-0000000-0',
      licencia: '001-0000000-0',
      telefono: '809-000-0000',
      turno: 'Matutino',
      estado: 'Activo',
    });
  };

  const handleUpdate = async (id: string) => {
    await update(id, { estado: 'Vacaciones' });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <Button onClick={handleCreate}>Crear Test</Button>
        <Button onClick={refresh}>Refrescar</Button>
      </div>

      {isLoading && <p>Cargando...</p>}

      <ul className="space-y-2">
        {items.map((item: any) => (
          <li key={item.id} className="flex items-center gap-2 p-2 border rounded">
            <span>{item.nombre}</span>
            <Button size="sm" onClick={() => handleUpdate(item.id)}>
              Actualizar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Test 3: Debounce de Búsqueda

```typescript
'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useApi } from '@/hooks/use-api';
import { Input } from '@/components/ui/input';
import { buildQueryParams } from '@/lib/api-utils';

export default function TestDebounceSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data, execute } = useApi({ showSuccessToast: false });

  useEffect(() => {
    if (debouncedSearch) {
      const params = buildQueryParams({ search: debouncedSearch });
      execute(`/api/conductores${params}`, 'GET');
    }
  }, [debouncedSearch, execute]);

  return (
    <div className="p-6">
      <Input
        placeholder="Buscar conductor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {data && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Fetch Simple

```typescript
const { data, isLoading, execute } = useApi<Conductor[]>();

useEffect(() => {
  execute('/api/conductores', 'GET');
}, []);
```

### Ejemplo 2: Create con Validación

```typescript
const { execute: createConductor, isLoading } = useApi<Conductor>({
  successMessage: 'Conductor creado exitosamente',
  onSuccess: (newConductor) => {
    console.log('Nuevo conductor:', newConductor);
    router.push(`/dashboard/conductores/${newConductor.id}`);
  },
});

const onSubmit = async (data: ConductorFormData) => {
  try {
    await createConductor('/api/conductores', 'POST', data);
  } catch (error) {
    console.error('Error al crear:', error);
  }
};
```

### Ejemplo 3: Lista con Filtros

```typescript
const { items, setFilters, isLoading } = useApiList<Conductor>({
  url: '/api/conductores',
  initialFilters: { estado: 'Activo' },
});

// Cambiar filtros
setFilters({ estado: 'Vacaciones', turno: 'Matutino' });
```

---

## Troubleshooting

### Error: "useToast must be used within ToastProvider"

**Solución:**
```typescript
// Verificar que layout.tsx tiene el ToastProvider
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### Error: "Failed to fetch"

**Solución:**
```typescript
// Verificar que la URL es correcta
console.log('Fetching from:', url);

// Verificar CORS en API Route
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Hook no actualiza estado después de operación

**Solución:**
```typescript
// Asegurarse de llamar refresh después de operaciones
const { refresh } = useApiList({ url: '/api/conductores' });

const handleDelete = async (id: string) => {
  await remove(id);
  await refresh(); // ✅ Importante
};
```

---

## Criterios de Aceptación

- [x] Hook `useApi` creado con manejo de errores
- [x] Hook `useApiList` implementado para listas CRUD
- [x] Hook `useDebounce` funcional
- [x] Helper `api-utils.ts` con utilidades
- [x] Toasts automáticos funcionando
- [x] Estados de loading manejados
- [x] Callbacks onSuccess/onError operativos
- [x] Tests de verificación pasan
- [x] Manejo de errores de Prisma implementado

---

## Archivos Creados

```
src/hooks/
├── use-api.ts              # Hook principal de API
├── use-api-list.ts         # Hook para listas CRUD
└── use-debounce.ts         # Hook de debounce

src/lib/
└── api-utils.ts            # Utilidades de API

test-useapi.tsx             # Tests de verificación (opcional)
test-useapi-list.tsx        # Tests CRUD (opcional)
test-debounce-search.tsx    # Test de búsqueda (opcional)
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 06: API Routes - Conductores](./HISTORIA-06-api-conductores.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10

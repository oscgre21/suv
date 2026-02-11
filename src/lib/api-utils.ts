import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Construye query params para URLs de API
 *
 * @example
 * buildQueryParams({ estado: 'Activo', turno: 'Matutino', page: 1 })
 * // Returns: "?estado=Activo&turno=Matutino&page=1"
 */
export function buildQueryParams(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Maneja errores comunes de Prisma y los convierte en respuestas HTTP apropiadas
 */
export function handlePrismaError(error: any): NextResponse {
  console.error('Prisma Error:', error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[] | undefined;
        const fieldName = field?.[0] || 'campo';
        return NextResponse.json(
          { error: `Ya existe un registro con ese ${fieldName}` },
          { status: 400 }
        );

      case 'P2025':
        // Record not found
        return NextResponse.json(
          { error: 'Registro no encontrado' },
          { status: 404 }
        );

      case 'P2003':
        // Foreign key constraint violation
        return NextResponse.json(
          { error: 'No se puede realizar la operación: existen registros relacionados' },
          { status: 400 }
        );

      case 'P2014':
        // Required relation violation
        return NextResponse.json(
          { error: 'La relación requerida no existe' },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          { error: `Error de base de datos: ${error.code}` },
          { status: 500 }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Datos de entrada inválidos' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}

/**
 * Valida que una respuesta de API tenga el formato correcto
 */
export function validateApiResponse<T>(data: any): data is { success: boolean; data?: T; error?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof data.success === 'boolean'
  );
}

/**
 * Ejecuta un fetch con reintentos automáticos
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Sanitiza input de búsqueda para evitar inyección SQL
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[;'"\\]/g, '') // Remove SQL special chars
    .trim()
    .slice(0, 200); // Limit length
}

/**
 * Convierte filtros de URL a formato Prisma where
 */
export function buildPrismaWhere(filters: Record<string, any>): Record<string, any> {
  const where: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        // Búsqueda en campos de texto (implementación específica por modelo)
        return;
      }

      if (typeof value === 'string') {
        where[key] = value;
      } else if (typeof value === 'boolean') {
        where[key] = value === 'true' || value === true;
      } else {
        where[key] = value;
      }
    }
  });

  return where;
}

/**
 * Extrae parámetros de paginación de URL
 */
export function extractPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Crea respuesta de paginación estándar
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

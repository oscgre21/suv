#!/bin/sh
set -e

echo "=== Iniciando aplicación CESAC ==="

# Validar variables de entorno requeridas
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL no está definida"
  echo "Por favor configura la variable de entorno DATABASE_URL en Dokploy"
  exit 1
fi

echo "✓ Variables de entorno validadas"
echo "DATABASE_URL: ${DATABASE_URL%%@*}@***" # Ocultar password

# Exportar DATABASE_URL explícitamente para Prisma
export DATABASE_URL="${DATABASE_URL}"

# Crear archivo .env temporal para que prisma.config.ts pueda leerlo
echo "DATABASE_URL=${DATABASE_URL}" > .env
echo "✓ Archivo .env temporal creado"

echo ""
echo "Esperando a que la base de datos esté disponible..."
# Opcional: agregar un wait-for script aquí si es necesario

echo ""
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Limpiar archivo .env temporal
rm -f .env

echo ""
echo "✓ Migraciones completadas exitosamente"
echo ""
echo "Iniciando servidor con Socket.IO en puerto 9002..."
exec node server.js

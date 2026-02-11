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

echo ""
echo "Esperando a que la base de datos esté disponible..."
# Opcional: agregar un wait-for script aquí si es necesario

echo ""
echo "Ejecutando migraciones de Prisma..."
# Las variables de entorno ya están disponibles en el sistema
# Solo necesitamos asegurar que estén exportadas
export DATABASE_URL="${DATABASE_URL}"
npx prisma migrate deploy

echo ""
echo "✓ Migraciones completadas exitosamente"
echo ""
echo "Iniciando servidor con Socket.IO en puerto 9002..."
exec node server.js

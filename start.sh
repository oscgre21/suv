#!/bin/sh
set -e

echo "Esperando a que la base de datos esté disponible..."
# Opcional: agregar un wait-for script aquí si es necesario

echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "Iniciando servidor con Socket.IO..."
exec node server.js

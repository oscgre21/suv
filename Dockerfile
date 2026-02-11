# Dockerfile para Next.js con Socket.IO y Prisma
FROM node:20-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Verificar https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para entender por qué libc6-compat podría ser necesario.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Instalar dependencias basadas en el gestor de paquetes preferido
COPY package.json package-lock.json* ./
RUN npm ci


# Rebuild del código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1

# Build de Next.js
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/start.sh ./start.sh

# Copiar el schema de Prisma
COPY --from=builder /app/prisma ./prisma

# Copiar build de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copiar node_modules con Prisma Client generado
COPY --from=builder /app/node_modules ./node_modules

# Dar permisos de ejecución al script de inicio
RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 9002

ENV PORT=9002
ENV HOSTNAME="0.0.0.0"

# Ejecutar script de inicio que maneja migraciones y servidor
CMD ["/app/start.sh"]

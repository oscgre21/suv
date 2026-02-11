# Guía de Despliegue con Docker

## Requisitos previos

- Docker instalado (versión 20.10+)
- Docker Compose instalado (versión 2.0+)

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@db:5432/cesac_db

# API Keys
GEMINI_API_KEY=tu_clave_de_gemini
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps

# Entorno
NODE_ENV=production
```

## Despliegue con Docker Compose (Recomendado)

### 1. Construcción y arranque de los servicios

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver los logs
docker-compose logs -f app
```

### 2. Detener los servicios

```bash
docker-compose down
```

### 3. Reiniciar los servicios

```bash
docker-compose restart
```

## Despliegue solo con Docker

### 1. Construir la imagen

```bash
docker build -t cesac-app .
```

### 2. Ejecutar el contenedor

```bash
docker run -d \
  --name cesac-app \
  -p 9002:9002 \
  -e DATABASE_URL="postgresql://usuario:password@host:5432/db" \
  -e GEMINI_API_KEY="tu_clave" \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_clave" \
  cesac-app
```

### 3. Ver logs

```bash
docker logs -f cesac-app
```

### 4. Detener el contenedor

```bash
docker stop cesac-app
docker rm cesac-app
```

## Características del Dockerfile

- **Multi-stage build**: Optimiza el tamaño de la imagen final
- **Node.js 20 Alpine**: Imagen base ligera
- **Prisma integrado**: Genera el cliente de Prisma durante el build
- **Socket.IO**: Soporta WebSockets para tiempo real
- **Migraciones automáticas**: Ejecuta las migraciones de Prisma al iniciar
- **Usuario no privilegiado**: Ejecuta la aplicación como usuario `nextjs` por seguridad

## Verificación del despliegue

Una vez iniciado el contenedor, verifica que la aplicación está funcionando:

```bash
# Verificar que el contenedor está corriendo
docker ps

# Acceder a la aplicación
curl http://localhost:9002

# O abre en el navegador
open http://localhost:9002
```

## Troubleshooting

### Error de conexión a la base de datos

Si obtienes errores de conexión a la base de datos:

1. Verifica que el `DATABASE_URL` es correcto
2. Asegúrate de que la base de datos PostgreSQL está accesible
3. Verifica que las migraciones se ejecutaron correctamente:

```bash
docker exec -it cesac-app npx prisma migrate status
```

### Reconstruir la imagen después de cambios

```bash
# Con docker-compose
docker-compose build --no-cache
docker-compose up -d

# Solo con Docker
docker build --no-cache -t cesac-app .
docker run -d -p 9002:9002 --env-file .env cesac-app
```

### Ver logs detallados

```bash
# Con docker-compose
docker-compose logs -f app

# Solo con Docker
docker logs -f cesac-app
```

## Despliegue en producción

Para producción, considera:

1. **Usar una base de datos externa** (no la del docker-compose)
2. **Configurar reverse proxy** (Nginx, Traefik)
3. **Certificados SSL** (Let's Encrypt)
4. **Health checks** y **auto-restart**
5. **Monitoreo** y **logs centralizados**
6. **Backups automáticos** de la base de datos

### Ejemplo con Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Soporte para WebSockets (Socket.IO)
    location /socket.io/ {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Actualización de la aplicación

```bash
# 1. Detener los servicios
docker-compose down

# 2. Actualizar el código (git pull, etc.)
git pull origin main

# 3. Reconstruir y reiniciar
docker-compose up -d --build

# 4. Verificar logs
docker-compose logs -f app
```

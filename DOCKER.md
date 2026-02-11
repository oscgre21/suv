# Docker Compose - Guía de Uso

Esta guía explica cómo usar Docker Compose para ejecutar la aplicación CESAC con todos sus servicios.

## Requisitos Previos

- Docker Desktop instalado (incluye Docker Compose)
- Las API Keys necesarias (Gemini, Google Maps)

## Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con tus API keys:

```bash
# API Keys
GEMINI_API_KEY=tu_clave_de_gemini_aqui
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps_aqui
```

> **Nota**: El `DATABASE_URL` ya está configurado en el docker-compose.yml y apunta a la base de datos PostgreSQL del contenedor.

### 2. Verificar la Configuración

El archivo `docker-compose.yml` incluye:
- **db**: Base de datos PostgreSQL 16
- **app**: Aplicación Next.js con Socket.IO
- **Network**: Red privada para comunicación entre contenedores
- **Volume**: Almacenamiento persistente para la base de datos

## Comandos Disponibles

### Iniciar la Aplicación

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Ver logs solo de la base de datos
docker-compose logs -f db
```

### Detener la Aplicación

```bash
# Detener servicios (mantiene los datos)
docker-compose stop

# Detener y eliminar contenedores (mantiene los datos)
docker-compose down

# Eliminar TODO incluyendo volúmenes (¡CUIDADO! Se pierden los datos)
docker-compose down -v
```

### Reconstruir la Aplicación

```bash
# Reconstruir solo la aplicación
docker-compose build app

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Gestión de Contenedores

```bash
# Ver estado de los servicios
docker-compose ps

# Ejecutar comando dentro del contenedor de la app
docker-compose exec app sh

# Ejecutar comando dentro del contenedor de base de datos
docker-compose exec db psql -U cesac_user -d cesac_db

# Reiniciar un servicio específico
docker-compose restart app
```

## Prisma y Base de Datos

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el contenedor gracias al script `start.sh`.

Si necesitas ejecutar migraciones manualmente:

```bash
# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# Generar cliente de Prisma
docker-compose exec app npx prisma generate

# Abrir Prisma Studio (requiere exponemos puerto 5555)
docker-compose exec app npx prisma studio
```

### Acceder a la Base de Datos

```bash
# Desde la terminal
docker-compose exec db psql -U cesac_user -d cesac_db

# O usando un cliente externo (ej: DBeaver, pgAdmin)
# Host: localhost
# Puerto: 5432
# Usuario: cesac_user
# Password: cesac_password
# Base de datos: cesac_db
```

### Backup y Restore

```bash
# Crear backup
docker-compose exec db pg_dump -U cesac_user cesac_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U cesac_user cesac_db < backup.sql
```

## Acceder a la Aplicación

Una vez iniciada, la aplicación estará disponible en:
- **Aplicación**: http://localhost:9002
- **Base de datos**: localhost:5432

## Solución de Problemas

### La aplicación no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Verificar que la base de datos esté saludable
docker-compose ps
```

### Error de conexión a la base de datos

El servicio `app` espera a que `db` esté saludable gracias al healthcheck. Si aún así hay problemas:

```bash
# Verificar que PostgreSQL esté respondiendo
docker-compose exec db pg_isready -U cesac_user

# Reiniciar servicios
docker-compose restart
```

### Limpiar y empezar de nuevo

```bash
# Detener todo y eliminar volúmenes
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

### Puerto ya en uso

Si el puerto 9002 o 5432 ya está en uso:

1. Edita `docker-compose.yml`
2. Cambia los puertos en la sección `ports`:
   ```yaml
   ports:
     - "PUERTO_NUEVO:9002"  # Para la app
     # o
     - "PUERTO_NUEVO:5432"  # Para la DB
   ```

## Modo Desarrollo

Para desarrollo con hot reload, descomenta las siguientes líneas en `docker-compose.yml`:

```yaml
volumes:
  - ./src:/app/src
  - ./public:/app/public
  - /app/node_modules
  - /app/.next
```

## Producción

Para producción, considera:

1. Usar secretos de Docker para las API keys
2. Configurar un proxy reverso (nginx, traefik)
3. Usar variables de entorno del sistema en lugar de archivo `.env`
4. Implementar backups automáticos de la base de datos
5. Configurar logs persistentes

## Estructura de Red

Los servicios se comunican a través de la red `cesac-network`:
- La app se conecta a la DB usando el nombre del servicio: `db:5432`
- No es necesario usar `localhost` dentro de los contenedores
- Los puertos expuestos permiten acceso desde el host

## Volúmenes

- `postgres_data`: Almacena los datos de PostgreSQL de forma persistente
  - Ubicación: gestionada por Docker
  - Se mantiene entre recreaciones de contenedores
  - Solo se elimina con `docker-compose down -v`

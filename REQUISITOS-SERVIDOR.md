# Requisitos de Infraestructura — Sistema CESAC

**Proyecto:** CESAC (Sistema de gestión de rutas, paradas y monitoreo en tiempo real)
**Stack:** Next.js 15 + Node.js 20 + PostgreSQL + Socket.IO + Prisma + Genkit (Google AI)
**Dirigido a:** Equipo de Infraestructura / Encargados de Servidores

---

## 1. Resumen ejecutivo

La aplicación es una plataforma web full-stack basada en **Next.js 15** con un servidor **Node.js personalizado** que expone tanto HTTP como **WebSockets (Socket.IO)** para comunicación en tiempo real. Persiste datos en **PostgreSQL** mediante **Prisma ORM**, e integra servicios de IA (Google Gemini) y mapas (Google Maps / Leaflet).

Se entrega contenedorizada vía **Docker** (multi-stage build).

---

## 2. Requisitos de hardware (servidor de aplicación)

| Recurso | Mínimo | Recomendado (producción) |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 50 GB SSD |
| Red | 100 Mbps | 1 Gbps |

> Nota: el build de Next.js consume RAM. Si el servidor también construye la imagen, mínimo 4 GB de RAM disponible durante el build.

## 3. Requisitos de hardware (servidor de base de datos)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 50 GB SSD | 100 GB SSD con backups |
| PostgreSQL | 14+ | 16 LTS |

Puede estar en la misma máquina del app server para entornos pequeños, o ser un servicio gestionado (AWS RDS, Azure Database for PostgreSQL, etc.) en producción.

---

## 4. Software requerido en el servidor

### Opción A — Despliegue con Docker (recomendado)
- **Docker Engine** ≥ 20.10
- **Docker Compose** ≥ 2.0
- **Git** (para clonar el repositorio)
- Acceso a Internet para descargar imágenes base (`node:20-alpine`)

### Opción B — Despliegue nativo (sin Docker)
- **Node.js** v20 LTS
- **npm** v10+
- **PostgreSQL** ≥ 14 (cliente y servidor)
- **OpenSSL** (requerido por Prisma)
- **libc6-compat** (en sistemas Alpine)

---

## 5. Puertos de red

| Puerto | Protocolo | Uso | Exposición |
|---|---|---|---|
| **9002** | TCP / HTTP + WebSocket | Aplicación Next.js + Socket.IO | Interno (detrás de reverse proxy) |
| **5432** | TCP | PostgreSQL | Solo accesible desde el app server |
| **80** | TCP / HTTP | Reverse proxy (Nginx/Traefik) | Público — redirige a 443 |
| **443** | TCP / HTTPS | Reverse proxy con TLS | Público |

**Importante:** Socket.IO usa el mismo puerto 9002 con upgrade de HTTP a WebSocket. El reverse proxy **debe soportar WebSockets** (ver sección 8).

---

## 6. Variables de entorno requeridas

Crear archivo `.env` en la raíz del proyecto con:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/cesac_db

# API Key de Google Gemini (IA generativa)
GEMINI_API_KEY=<clave_proporcionada_por_el_equipo>

# API Key de Google Maps (mapas en el cliente)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<clave_proporcionada_por_el_equipo>

# Entorno
NODE_ENV=production
PORT=9002
HOSTNAME=0.0.0.0
```

> **Seguridad:** las claves `GEMINI_API_KEY` y `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` deben gestionarse en un vault (AWS Secrets Manager, HashiCorp Vault, etc.) y nunca commitearse al repositorio.

---

## 7. Salidas de red requeridas (egress)

El servidor de aplicación debe poder hacer peticiones salientes a:

| Servicio | Dominio | Puerto | Propósito |
|---|---|---|---|
| Google Generative AI | `generativelanguage.googleapis.com` | 443 | Genkit / Gemini |
| Google Maps API | `maps.googleapis.com` | 443 | Geocoding, mapas |
| npm registry | `registry.npmjs.org` | 443 | Solo durante el build |
| Docker Hub | `registry-1.docker.io` | 443 | Solo durante build de imagen |

---

## 8. Reverse proxy (obligatorio en producción)

Se requiere un reverse proxy (**Nginx** o **Traefik**) delante de la aplicación para:
- Terminación SSL/TLS (certificados Let's Encrypt recomendados)
- Soporte de WebSockets (headers `Upgrade` y `Connection`)
- Compresión gzip/brotli
- Rate limiting

### Ejemplo de configuración Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name app.cesac.gob.do;

    ssl_certificate     /etc/letsencrypt/live/.../fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSockets para Socket.IO (tiempo real)
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

---

## 9. Base de datos PostgreSQL

- **Versión:** 14 o superior (recomendado 16 LTS)
- **Esquema:** se crea automáticamente al iniciar el contenedor mediante `prisma migrate deploy` (ejecutado en `start.sh`)
- **Usuario de base de datos:** con permisos `CREATE`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`, `SELECT` sobre la base `cesac_db`
- **Extensiones necesarias:** ninguna especial
- **SSL:** configurable mediante el parámetro `sslmode=require` en `DATABASE_URL` si la BD lo exige

### Backups
Se recomienda:
- Backup completo diario (pg_dump)
- Backup incremental cada 6 horas (WAL archiving)
- Retención: 30 días mínimo

---

## 10. Procedimiento de despliegue

### Con Docker Compose (recomendado)
```bash
# 1. Clonar el repositorio
git clone <repo-url> cesac
cd cesac

# 2. Crear archivo .env con variables del punto 6

# 3. Construir y levantar
docker-compose up -d --build

# 4. Verificar
docker-compose logs -f app
curl http://localhost:9002
```

El script `start.sh` dentro del contenedor ejecuta automáticamente:
1. `prisma migrate deploy` (aplica migraciones pendientes)
2. `node server.js` (arranca el servidor con Socket.IO)

---

## 11. Consideraciones de alta disponibilidad

Para entornos críticos:

| Componente | Estrategia |
|---|---|
| App server | 2+ instancias detrás de un balanceador de carga con **sticky sessions** (requerido por Socket.IO) |
| Base de datos | Réplica primaria/secundaria con failover automático |
| Almacenamiento de assets | CDN para `/public` (opcional) |
| Logs | Centralizados (ELK, Grafana Loki, CloudWatch) |
| Monitoreo | Prometheus + Grafana, o equivalente |
| Health checks | `GET /` con timeout de 5s |

> **Nota sobre Socket.IO:** si se escala horizontalmente, se requiere un adaptador de Redis (`@socket.io/redis-adapter`) para sincronizar eventos entre instancias. Actualmente no está implementado y debe coordinarse con el equipo de desarrollo.

---

## 12. Seguridad

- Ejecutar el contenedor como usuario no-root (`nextjs:nodejs`, UID 1001) — ya configurado en el Dockerfile
- Firewall: solo exponer 80/443 al exterior
- TLS obligatorio en producción
- Rotación periódica de API keys
- Política de contraseñas: las contraseñas de usuarios se hashean con **bcrypt** (10 rounds)
- Sesiones JWT firmadas con `jose`

---

## 13. Contacto técnico

Para dudas sobre el despliegue o la configuración, contactar al equipo de desarrollo.

**Documentación adicional incluida en el repositorio:**
- [DEPLOYMENT.md](DEPLOYMENT.md) — Guía detallada de despliegue
- [DOCKER.md](DOCKER.md) — Notas específicas de Docker
- [DOKPLOY.md](DOKPLOY.md) — Despliegue con Dokploy
- [docs/arquitectura.md](docs/arquitectura.md) — Arquitectura del sistema

# Guía de Despliegue en Dokploy

## Requisitos previos

- Cuenta en Dokploy o instancia de Dokploy configurada
- Repositorio Git con el código
- Base de datos PostgreSQL (puede ser externa o crear una en Dokploy)

## Paso 1: Crear la Base de Datos PostgreSQL

### Opción A: Crear base de datos en Dokploy

1. En el dashboard de Dokploy, ve a **Databases**
2. Haz clic en **Create Database**
3. Selecciona **PostgreSQL**
4. Configura:
   - **Name**: `cesac-db` (o el nombre que prefieras)
   - **Username**: `cesac_user`
   - **Password**: Genera una contraseña segura
   - **Database Name**: `cesac_db`
5. Guarda y espera a que la base de datos esté lista
6. Copia la **Connection String** que se genera automáticamente

### Opción B: Usar base de datos externa

Si ya tienes una base de datos PostgreSQL, asegúrate de tener la cadena de conexión:
```
postgresql://usuario:password@host:puerto/nombre_db
```

## Paso 2: Crear la Aplicación en Dokploy

1. En el dashboard de Dokploy, ve a **Applications**
2. Haz clic en **Create Application**
3. Selecciona **Docker** como tipo de aplicación
4. Configura:
   - **Name**: `cesac-app`
   - **Repository**: URL de tu repositorio Git
   - **Branch**: `main` (o la rama que uses)
   - **Build Type**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`

## Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables** de tu aplicación, agrega las siguientes variables:

### Variables Requeridas:

```env
DATABASE_URL=postgresql://usuario:password@host:puerto/cesac_db
```

**IMPORTANTE**: Si creaste la base de datos en Dokploy, usa la cadena de conexión que te proporcionó. El formato típico para bases de datos internas de Dokploy es:
```
postgresql://usuario:password@nombre-del-servicio:5432/nombre_db
```

### Variables Opcionales:

```env
GEMINI_API_KEY=tu_clave_de_gemini
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
NODE_ENV=production
```

### Ejemplo de configuración completa:

```env
DATABASE_URL=postgresql://cesac_user:mi_password_seguro@cesac-db:5432/cesac_db
GEMINI_API_KEY=AIzaSyAgblHISwV43r9BgLf1BzsjtWTCClVrAlI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_aqui
NODE_ENV=production
```

## Paso 4: Configurar el Puerto

1. En la sección **Ports** de tu aplicación:
   - **Container Port**: `9002`
   - **Public Port**: Deja que Dokploy asigne uno automáticamente o especifica `9002`

## Paso 5: Configurar Dominio (Opcional)

Si quieres usar un dominio personalizado:

1. Ve a la sección **Domains**
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones de Dokploy
4. Dokploy configurará automáticamente SSL con Let's Encrypt

## Paso 6: Desplegar

1. Haz clic en **Deploy** o **Build & Deploy**
2. Espera a que se complete el build (puede tomar 5-10 minutos la primera vez)
3. Revisa los logs en tiempo real para verificar que todo esté bien

### Verificación de logs exitosos:

Deberías ver algo como:
```
=== Iniciando aplicación CESAC ===
✓ Variables de entorno validadas
DATABASE_URL: postgresql://cesac_user@***

Esperando a que la base de datos esté disponible...

Ejecutando migraciones de Prisma...
✓ Migraciones completadas exitosamente

Iniciando servidor con Socket.IO en puerto 9002...
> Ready on http://0.0.0.0:9002
> Socket.IO server running
```

## Paso 7: Verificar el Despliegue

Una vez completado el despliegue:

1. Visita la URL que Dokploy te proporcionó
2. Verifica que la aplicación carga correctamente
3. Prueba las funcionalidades principales

## Troubleshooting

### Error: "DATABASE_URL no está definida"

**Solución**: Verifica que agregaste la variable de entorno `DATABASE_URL` en la configuración de Dokploy.

### Error: "Can't reach database server"

**Posibles causas**:
1. La base de datos no está corriendo
2. La cadena de conexión es incorrecta
3. El nombre del host de la base de datos es incorrecto

**Solución para base de datos en Dokploy**:
- Si la base de datos está en el mismo servidor Dokploy, usa el nombre del servicio de la base de datos como host
- Ejemplo: `postgresql://usuario:password@cesac-db:5432/cesac_db`
- NO uses `localhost` o `127.0.0.1` si la base de datos está en otro contenedor

### Error en migraciones de Prisma

**Solución**:
1. Ve a los logs de la aplicación
2. Si las migraciones fallan, puedes ejecutarlas manualmente:
   ```bash
   # En la terminal de Dokploy
   npx prisma migrate deploy
   ```

### La aplicación no responde

**Verificaciones**:
1. Revisa que el puerto 9002 esté correctamente expuesto
2. Verifica los logs de la aplicación
3. Asegúrate de que no hay errores en el startup

## Actualización de la Aplicación

Para actualizar tu aplicación después de hacer cambios:

1. Haz push de tus cambios al repositorio Git
2. En Dokploy, ve a tu aplicación
3. Haz clic en **Redeploy** o configura **Auto Deploy** para que se actualice automáticamente con cada push

## Configuración Avanzada

### Health Checks

Dokploy puede configurar health checks automáticos. Configura:
- **Health Check Path**: `/` o `/api/health` (si implementas un endpoint de health)
- **Health Check Interval**: `30s`

### Auto-scaling (Si tu plan lo soporta)

Configura reglas de auto-scaling basadas en:
- CPU usage
- Memoria
- Número de requests

### Logs y Monitoreo

- Accede a los logs en tiempo real desde el dashboard de Dokploy
- Configura alertas para errores críticos
- Revisa métricas de rendimiento

## Backup de Base de Datos

Es importante configurar backups automáticos de tu base de datos:

1. En la sección de tu base de datos PostgreSQL
2. Configura backups automáticos
3. Define la frecuencia (diario recomendado)
4. Configura retención de backups

## Variables de Entorno Seguras

**IMPORTANTE**: Nunca commits archivos `.env` con credenciales reales al repositorio.

- Usa el `.env.example` como plantilla
- Configura las variables sensibles directamente en Dokploy
- Dokploy encripta las variables de entorno automáticamente

## Soporte WebSockets

La aplicación usa Socket.IO para WebSockets. Dokploy soporta WebSockets automáticamente, pero asegúrate de que:

1. El proxy reverso de Dokploy está configurado correctamente (usualmente automático)
2. Si usas un dominio personalizado, verifica que las conexiones WebSocket funcionan

## Ejemplo de Arquitectura Final

```
Internet
    ↓
[Dokploy Load Balancer + SSL]
    ↓
[cesac-app Container] ← Variables de entorno
    ↓
[PostgreSQL Database Container]
```

## Costos y Recursos Recomendados

Para un despliegue en producción, recomendamos:

- **CPU**: 1-2 cores
- **RAM**: 2-4 GB
- **Storage**: 20 GB
- **Database**: PostgreSQL 16 con 1 GB RAM

## Contacto y Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs en Dokploy
2. Verifica todas las variables de entorno
3. Consulta la documentación oficial de Dokploy: https://docs.dokploy.com

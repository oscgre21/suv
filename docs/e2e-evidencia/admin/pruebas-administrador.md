# 🛡️ Pruebas E2E — Acceso de Administrador

**Rol:** Administrador  
**Área protegida:** `/dashboard`  
**Credenciales de prueba:** `admin@cesac.com` / `admin123`

---

## ▶️ Video del recorrido

[`recorrido-admin.webm`](./recorrido-admin.webm) — recorrido completo de las pantallas de este rol (formato WebM).

> GitHub/VS Code reproducen `.webm` en línea; si tu visor no lo soporta, descárgalo.

---

## ✅ Validaciones de control de acceso

- El admin **inicia sesión** y entra a `/dashboard`.
- Los endpoints de gestión (`/api/dashboard/stats`, `/api/usuarios`) responden **200 OK** con su sesión.
- Sin sesión, esos endpoints responden **401/403**.

---

## 🖼️ Pantallas (16)

### Login

![Login](./screenshots/00-login.png)

### Panel control gps

![Panel control gps](./screenshots/01-panel-control-gps.png)

### Solicitudes y paradas

![Solicitudes y paradas](./screenshots/02-solicitudes-y-paradas.png)

### Gestion rutas

![Gestion rutas](./screenshots/03-gestion-rutas.png)

### Gestion usuarios

![Gestion usuarios](./screenshots/04-gestion-usuarios.png)

### Choferes y vehiculos

![Choferes y vehiculos](./screenshots/05-choferes-y-vehiculos.png)

### Horarios

![Horarios](./screenshots/06-horarios.png)

### Reportes

![Reportes](./screenshots/07-reportes.png)

### Configuracion

![Configuracion](./screenshots/08-configuracion.png)

### Data master

![Data master](./screenshots/09-data-master.png)

### Data master conductores

![Data master conductores](./screenshots/10-data-master-conductores.png)

### Data master vehiculos

![Data master vehiculos](./screenshots/11-data-master-vehiculos.png)

### Data master rutas

![Data master rutas](./screenshots/12-data-master-rutas.png)

### Data master rutas especiales

![Data master rutas especiales](./screenshots/13-data-master-rutas-especiales.png)

### Data master estatus vehiculo

![Data master estatus vehiculo](./screenshots/14-data-master-estatus-vehiculo.png)

### Perfil

![Perfil](./screenshots/15-perfil.png)


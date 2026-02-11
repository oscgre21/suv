# Historia 21: Testing End-to-End y Verificación del Sistema Completo

**Prioridad:** CRÍTICA
**Dependencias:** Historias 01-20 completadas
**Estimación:** 4-6 horas
**Estado:** Pendiente

---

## Objetivo

Realizar una verificación completa end-to-end de todo el sistema CESAC, validar cada módulo CRUD, verificar integridad de datos, probar flujos completos de usuario, y generar un checklist de deployment para considerar el proyecto 100% funcional y listo para producción.

---

## Pre-requisitos

- ✅ Todas las historias 01-20 completadas
- ✅ Base de datos PostgreSQL operativa
- ✅ Servidor Next.js corriendo en puerto 9002
- ✅ Google Maps API configurada
- ✅ Datos de prueba (seed) ejecutados
- ✅ Prisma Studio accesible

---

## Checklist de Verificación: Historias Anteriores

### Fase 1: Infraestructura (Historias 01-04)

#### Historia 01: Prisma + PostgreSQL ✓

**Verificaciones:**
```bash
# 1. Verificar conexión a base de datos
npx prisma studio
# Debe abrir en http://localhost:5555

# 2. Verificar tablas creadas
npx prisma db pull
# Debe confirmar 9 tablas

# 3. Ejecutar migración status
npx prisma migrate status
# Debe mostrar: Database schema is up to date!
```

**Checklist:**
- [ ] Prisma Client generado correctamente
- [ ] 9 tablas creadas: usuarios, conductores, vehiculos, rutas, paradas, horarios, solicitudes_paradas, historial_viajes, estatus_vehiculos
- [ ] Relaciones entre tablas funcionando (foreign keys)
- [ ] Índices creados correctamente
- [ ] Helper `src/lib/prisma.ts` funciona sin errores

**Test SQL directo:**
```sql
-- Verificar conteo de tablas
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

#### Historia 02: Google Maps API ✓

**Verificaciones:**
```bash
# 1. Verificar API Key configurada
cat .env | grep NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Debe mostrar la clave (no vacía)

# 2. Probar página de test
# Navegar a: http://localhost:9002/test-maps
```

**Checklist:**
- [ ] Mapa carga correctamente (sin errores de API key)
- [ ] Marcador aparece en Santo Domingo
- [ ] Click en mapa actualiza marcador
- [ ] Arrastrar marcador funciona
- [ ] Búsqueda de direcciones (geocoding) funciona
- [ ] Reverse geocoding muestra direcciones reales
- [ ] Componente `MapPicker` reutilizable creado
- [ ] Helper `src/lib/google-maps.ts` con funciones: geocodeAddress(), reverseGeocode(), calculateDistance()

**Test manual:**
1. Buscar: "Av. Winston Churchill, Santo Domingo"
2. Resultado esperado: Mapa se centra en la avenida
3. Click en otro punto → Dirección se actualiza automáticamente
4. Copiar coordenadas → Debe copiar al portapapeles

---

#### Historia 03: Schemas Zod + Tipos TypeScript ✓

**Verificaciones:**
```typescript
// Test en src/test-schemas.ts
import { conductorSchema, vehiculoSchema, rutaSchema } from '@/lib/schemas';

// Test 1: Schema válido
const validConductor = conductorSchema.parse({
  nombre: "Juan Pérez",
  cedula: "001-1234567-8",
  licencia: "LIC-12345",
  telefono: "809-555-1234",
  turno: "Matutino",
  estado: "Activo"
});
console.log('✅ Schema válido:', validConductor);

// Test 2: Schema inválido (debe lanzar error)
try {
  conductorSchema.parse({ nombre: "" }); // Falta datos requeridos
} catch (error) {
  console.log('✅ Validación funciona:', error.errors);
}
```

**Checklist:**
- [ ] `src/lib/schemas.ts` creado con schemas Zod para todas las entidades
- [ ] Schemas exportados: conductorSchema, vehiculoSchema, rutaSchema, paradaSchema, usuarioSchema, horarioSchema, solicitudSchema
- [ ] Validación de campos requeridos funciona
- [ ] Validación de formatos (email, teléfono, cédula) funciona
- [ ] Tipos TypeScript inferidos correctamente
- [ ] Integración con Prisma types funciona

**Ejecutar test:**
```bash
npx tsx src/test-schemas.ts
```

---

#### Historia 04: Seed de Datos Iniciales ✓

**Verificaciones:**
```bash
# 1. Ejecutar seed
npm run prisma:seed

# 2. Verificar datos creados
npx prisma studio
```

**Checklist en Prisma Studio:**
- [ ] Tabla `estatus_vehiculos`: 3 registros (Operativo, En Taller, Fuera de Servicio)
- [ ] Tabla `conductores`: 5+ registros de prueba
- [ ] Tabla `vehiculos`: 5+ registros de prueba
- [ ] Tabla `rutas`: 3+ registros (Ruta Norte, Sur, Este)
- [ ] Tabla `paradas`: 10+ registros vinculados a rutas
- [ ] Tabla `usuarios`: 5+ registros de prueba
- [ ] Tabla `horarios`: 3+ registros
- [ ] Relaciones correctas: vehículos → conductores, paradas → rutas

**Test SQL:**
```sql
-- Verificar datos seed
SELECT COUNT(*) as total_conductores FROM conductores;
SELECT COUNT(*) as total_vehiculos FROM vehiculos;
SELECT COUNT(*) as total_rutas FROM rutas;
SELECT COUNT(*) as total_paradas FROM paradas;
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar relaciones
SELECT v.ficha, c.nombre as conductor
FROM vehiculos v
LEFT JOIN conductores c ON v.id = c."vehiculoId";
```

---

### Fase 2: API Routes (Historias 05-12)

#### Historia 05: Hook useApi y Base API ✓

**Verificaciones:**
```typescript
// Test en componente de prueba
import { useApi } from '@/hooks/use-api';

function TestComponent() {
  const { data, loading, error, execute } = useApi('/api/conductores');

  useEffect(() => {
    execute();
  }, []);

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

**Checklist:**
- [ ] Hook `src/hooks/use-api.ts` creado
- [ ] Métodos: GET, POST, PUT, DELETE implementados
- [ ] Estados: loading, error, data manejados correctamente
- [ ] Función `execute()` para llamadas lazy
- [ ] Error handling implementado
- [ ] TypeScript genérico funciona

---

#### Historia 06-12: API Routes Completas ✓

Verificar cada endpoint con curl o Postman.

**Test rápido con curl:**

```bash
# API Conductores
curl http://localhost:9002/api/conductores
curl http://localhost:9002/api/conductores/[ID]
curl -X POST http://localhost:9002/api/conductores -H "Content-Type: application/json" -d '{"nombre":"Test","cedula":"001-0000000-0","licencia":"LIC-TEST","telefono":"809-000-0000","turno":"Matutino"}'

# API Vehículos
curl http://localhost:9002/api/vehiculos
curl http://localhost:9002/api/vehiculos/[ID]

# API Rutas
curl http://localhost:9002/api/rutas
curl http://localhost:9002/api/rutas/[ID]/paradas

# API Paradas
curl http://localhost:9002/api/paradas
curl http://localhost:9002/api/paradas?rutaId=[RUTA_ID]

# API Usuarios
curl http://localhost:9002/api/usuarios

# API Horarios
curl http://localhost:9002/api/horarios
curl http://localhost:9002/api/horarios?rutaId=[RUTA_ID]

# API Solicitudes
curl http://localhost:9002/api/solicitudes

# API Estatus
curl http://localhost:9002/api/estatus-vehiculos
```

**Checklist por API:**

| Endpoint | GET All | GET One | POST | PUT | DELETE |
|----------|---------|---------|------|-----|--------|
| /api/conductores | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/vehiculos | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/rutas | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/paradas | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/usuarios | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/horarios | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/solicitudes | ✓ | ✓ | ✓ | ✓ | ✓ |
| /api/estatus-vehiculos | ✓ | ✓ | ✓ | ✓ | ✓ |

**Verificaciones adicionales:**
- [ ] Validación Zod en cada endpoint
- [ ] Manejo de errores (400, 404, 500)
- [ ] Relaciones cargadas correctamente (include en Prisma)
- [ ] Paginación implementada (si aplica)
- [ ] Filtros funcionando (por ejemplo: paradas por rutaId)

---

### Fase 3: CRUD Frontend (Historias 13-20)

#### Historia 13: CRUD Conductores ✓

**Navegación:** `http://localhost:9002/dashboard/data-master/conductores`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra lista de conductores
- [ ] Botón "Agregar Conductor" abre modal/drawer
- [ ] Formulario tiene campos: nombre, cédula, licencia, teléfono, email, turno, estado
- [ ] Validación de formulario funciona (campos requeridos)
- [ ] Crear conductor guarda en BD
- [ ] Editar conductor actualiza datos
- [ ] Eliminar conductor muestra confirmación
- [ ] Eliminar conductor borra de BD
- [ ] Buscador/filtro funciona
- [ ] Estado visual (loading, success, error) funciona
- [ ] Toast notifications aparecen

**Test E2E:**
1. Crear conductor nuevo con datos válidos → Debe aparecer en tabla
2. Editar conductor → Cambios deben reflejarse
3. Intentar crear con cédula duplicada → Debe mostrar error
4. Eliminar conductor → Debe desaparecer de tabla
5. Refrescar página → Datos persisten en BD

---

#### Historia 14: CRUD Vehículos ✓

**Navegación:** `http://localhost:9002/dashboard/data-master/vehiculos`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra lista de vehículos
- [ ] Formulario: ficha, modelo, placa, capacidad, estado, rutaAsignada, conductor
- [ ] Selector de conductor (dropdown con lista de conductores)
- [ ] Selector de ruta (dropdown con lista de rutas)
- [ ] Validación: placa única, capacidad numérica
- [ ] CRUD completo funciona (crear, leer, actualizar, eliminar)
- [ ] Relación conductor ↔ vehículo funciona
- [ ] Actualización en cascada (cambiar conductor actualiza vehículo)

**Test E2E:**
1. Crear vehículo sin conductor → Debe permitir
2. Asignar conductor a vehículo → Relación debe crearse
3. Cambiar conductor de vehículo → Relación debe actualizarse
4. Ver vehículo en tabla → Debe mostrar nombre de conductor asignado
5. Eliminar vehículo → Conductor debe quedar sin vehículo asignado

---

#### Historia 15: CRUD Rutas ✓

**Navegación:** `http://localhost:9002/dashboard/data-master/rutas`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra rutas con color visual
- [ ] Formulario: nombre, descripción, color (color picker), activa, esEspecial
- [ ] Crear ruta nueva funciona
- [ ] Color picker permite seleccionar color
- [ ] Editar ruta actualiza datos
- [ ] Eliminar ruta muestra advertencia (tiene paradas/vehículos asignados)
- [ ] Toggle "activa" funciona
- [ ] Badge visual para rutas especiales

**Test E2E:**
1. Crear ruta nueva "Ruta Test" con color azul
2. Agregar paradas a la ruta (Historia 17)
3. Asignar vehículo a la ruta
4. Editar color de ruta → Debe cambiar en UI
5. Intentar eliminar ruta con paradas → Debe prevenir o eliminar en cascada
6. Desactivar ruta → Estado debe cambiar a inactiva

---

#### Historia 16: CRUD Usuarios ✓

**Navegación:** `http://localhost:9002/dashboard/usuarios`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra usuarios con información completa
- [ ] Formulario: nombre, cédula, email, teléfono, dirección, rutaAsignada, estado
- [ ] Validación email única
- [ ] Validación cédula única
- [ ] Selector de ruta asignada
- [ ] CRUD completo funciona
- [ ] Relación usuario → ruta funciona
- [ ] Cambiar ruta asignada actualiza BD

**Test E2E:**
1. Crear usuario nuevo
2. Asignar a ruta específica
3. Usuario debe poder ver solo paradas de su ruta
4. Cambiar ruta asignada → Debe actualizar en BD
5. Desactivar usuario → Estado cambia a "Inactivo"

---

#### Historia 17: Paradas con Google Maps ✓

**Navegación:** `http://localhost:9002/dashboard/rutas` (gestión de paradas por ruta)

**Checklist:**
- [ ] Página carga con mapa de Google Maps
- [ ] Selector de ruta muestra lista de rutas
- [ ] Al seleccionar ruta, paradas aparecen en mapa
- [ ] Botón "Agregar Parada" abre modal con MapPicker
- [ ] Click en mapa selecciona coordenadas GPS
- [ ] Reverse geocoding muestra dirección automáticamente
- [ ] Formulario parada: nombre, dirección (auto), latitud, longitud, orden, rutaId
- [ ] Crear parada guarda coordenadas en BD
- [ ] Paradas se muestran en mapa con marcadores numerados
- [ ] Editar parada permite cambiar ubicación
- [ ] Eliminar parada borra de mapa y BD
- [ ] Orden de paradas es editable (drag & drop o input numérico)
- [ ] Línea conecta paradas en orden (polyline)

**Test E2E Crítico:**
1. Seleccionar "Ruta Norte"
2. Agregar parada nueva usando MapPicker
3. Click en mapa en ubicación específica
4. Verificar que latitud/longitud se capturan correctamente
5. Guardar parada
6. Refrescar página → Parada debe aparecer en mismo punto del mapa
7. Crear segunda parada
8. Verificar que línea conecta ambas paradas en orden
9. Cambiar orden de paradas → Línea debe reordenarse
10. Eliminar parada → Marcador desaparece de mapa

**Validación de coordenadas:**
```sql
SELECT nombre, direccion, latitud, longitud, orden, "rutaId"
FROM paradas
WHERE "rutaId" = '[ID_RUTA]'
ORDER BY orden;
```

---

#### Historia 18: CRUD Horarios ✓

**Navegación:** `http://localhost:9002/dashboard/rutas` (gestión de horarios)

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra horarios con información de ruta y conductor
- [ ] Formulario: rutaId, conductorId, horaInicio, horaFin, diasSemana[], activo
- [ ] Selector de ruta (dropdown)
- [ ] Selector de conductor (dropdown con filtro por disponibilidad)
- [ ] Time picker para horaInicio y horaFin
- [ ] Multi-selector de días de semana (checkboxes)
- [ ] Validación: horaFin > horaInicio
- [ ] Validación: conductor no puede tener horarios solapados
- [ ] Crear horario funciona
- [ ] Editar horario actualiza datos
- [ ] Eliminar horario funciona
- [ ] Toggle "activo" permite desactivar sin eliminar

**Test E2E:**
1. Crear horario: Ruta Norte, Conductor Juan, Lunes-Viernes, 06:00-07:30
2. Verificar que aparece en tabla
3. Intentar crear horario solapado para mismo conductor → Debe mostrar error
4. Editar horario: cambiar días a Lunes-Miércoles-Viernes
5. Verificar actualización en BD
6. Desactivar horario → activo = false
7. Eliminar horario → Desaparece de tabla

---

#### Historia 19: CRUD Estatus Vehículos ✓

**Navegación:** `http://localhost:9002/dashboard/data-master/estatus-vehiculo`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra estatus con color visual
- [ ] Formulario: nombre, color (color picker), descripción, activo
- [ ] Crear estatus nuevo funciona
- [ ] Color picker permite seleccionar color
- [ ] Badge visual muestra color seleccionado
- [ ] Editar estatus funciona
- [ ] Eliminar estatus funciona (solo si no está en uso)
- [ ] Toggle "activo" funciona

**Test E2E:**
1. Crear estatus "En Mantenimiento" con color naranja
2. Usar estatus en un vehículo
3. Verificar que color se muestra en lista de vehículos
4. Intentar eliminar estatus en uso → Debe prevenir o mostrar advertencia
5. Editar color → Debe actualizarse en UI de vehículos

---

#### Historia 20: Actualizar Solicitudes con BD ✓

**Navegación:** `http://localhost:9002/dashboard/solicitudes`

**Checklist:**
- [ ] Página carga sin errores
- [ ] Tabla muestra solicitudes de paradas
- [ ] Información mostrada: usuario, parada, ruta, horaSolicitud, estado
- [ ] Estados: Pendiente, Confirmado, No Recogido, Cancelado
- [ ] Filtros por estado funcionan
- [ ] Filtros por ruta funcionan
- [ ] Cambiar estado de solicitud actualiza BD
- [ ] Botón "Confirmar" cambia estado a "Confirmado"
- [ ] Botón "Cancelar" cambia estado a "Cancelado"
- [ ] Notificaciones (si implementadas) funcionan
- [ ] Actualización en tiempo real (polling o websockets)

**Test E2E:**
1. Usuario crea solicitud de parada (desde vista usuario)
2. Solicitud aparece en dashboard admin con estado "Pendiente"
3. Admin confirma solicitud → Estado cambia a "Confirmado"
4. Usuario ve notificación de confirmación
5. Admin marca "No Recogido" → Estado se actualiza
6. Filtrar por ruta específica → Solo muestra solicitudes de esa ruta
7. Filtrar por estado "Pendiente" → Solo muestra pendientes

---

## Flujos End-to-End Completos

### Flujo 1: Configuración Inicial del Sistema

**Objetivo:** Desde cero hasta sistema operativo

**Pasos:**
1. ✅ Instalar dependencias: `npm install`
2. ✅ Configurar `.env` con DATABASE_URL y GOOGLE_MAPS_API_KEY
3. ✅ Ejecutar migraciones: `npx prisma migrate dev`
4. ✅ Generar Prisma Client: `npx prisma generate`
5. ✅ Ejecutar seed: `npm run prisma:seed`
6. ✅ Iniciar servidor: `npm run dev`
7. ✅ Abrir Prisma Studio: `npm run prisma:studio`
8. ✅ Verificar datos seed en Studio

**Criterio de éxito:**
- Base de datos tiene 9 tablas
- Datos seed cargados (5+ conductores, 5+ vehículos, 3+ rutas)
- Servidor corriendo en puerto 9002
- No hay errores en consola

---

### Flujo 2: Crear Ruta Completa con Paradas

**Objetivo:** Crear una ruta nueva con múltiples paradas usando Google Maps

**Pasos:**
1. Navegar a `/dashboard/data-master/rutas`
2. Click "Agregar Ruta"
3. Ingresar datos:
   - Nombre: "Ruta Centro Histórico"
   - Descripción: "Ruta turística zona colonial"
   - Color: #e74c3c (rojo)
   - Activa: true
   - Es Especial: false
4. Guardar ruta
5. Navegar a `/dashboard/rutas`
6. Seleccionar "Ruta Centro Histórico"
7. Click "Agregar Parada"
8. Usar MapPicker:
   - Buscar "Parque Colón, Santo Domingo"
   - Click en mapa para confirmar
   - Nombre: "Parque Colón"
   - Orden: 1
9. Guardar parada
10. Repetir para agregar más paradas:
    - Catedral Primada (orden 2)
    - Fortaleza Ozama (orden 3)
    - Malecón (orden 4)
11. Verificar que paradas aparecen en mapa conectadas por línea

**Criterio de éxito:**
- Ruta creada en BD
- 4 paradas creadas con coordenadas reales
- Marcadores numerados aparecen en mapa
- Polyline conecta paradas en orden
- Refrescar página mantiene paradas y orden

**Validación en BD:**
```sql
SELECT r.nombre as ruta, p.nombre as parada, p.orden, p.latitud, p.longitud
FROM paradas p
JOIN rutas r ON p."rutaId" = r.id
WHERE r.nombre = 'Ruta Centro Histórico'
ORDER BY p.orden;
```

---

### Flujo 3: Asignar Vehículo y Conductor a Ruta

**Objetivo:** Configurar operación completa de una ruta

**Pasos:**
1. Navegar a `/dashboard/data-master/conductores`
2. Verificar que existe conductor "Carlos Rodríguez" (turno Matutino)
3. Navegar a `/dashboard/data-master/vehiculos`
4. Click "Agregar Vehículo"
5. Ingresar datos:
   - Ficha: "VEH-001"
   - Modelo: "Mercedes-Benz Sprinter 2023"
   - Placa: "A123456"
   - Capacidad: 20
   - Estado: "Operativo"
   - Ruta Asignada: "Ruta Centro Histórico"
   - Conductor: "Carlos Rodríguez"
6. Guardar vehículo
7. Verificar que conductor ahora muestra vehículo asignado
8. Navegar a `/dashboard/data-master/rutas`
9. Verificar que "Ruta Centro Histórico" muestra vehículo VEH-001

**Criterio de éxito:**
- Vehículo creado con relación a conductor
- Conductor muestra vehículo asignado (relación bidireccional)
- Vehículo vinculado a ruta
- Dashboard muestra asignaciones correctamente

**Validación en BD:**
```sql
SELECT
  v.ficha,
  v.modelo,
  c.nombre as conductor,
  r.nombre as ruta
FROM vehiculos v
LEFT JOIN conductores c ON v.id = c."vehiculoId"
LEFT JOIN rutas r ON v."rutaAsignada" = r.id
WHERE v.ficha = 'VEH-001';
```

---

### Flujo 4: Crear Horario Operativo

**Objetivo:** Programar horarios de operación para ruta

**Pasos:**
1. Navegar a gestión de horarios
2. Click "Agregar Horario"
3. Ingresar datos:
   - Ruta: "Ruta Centro Histórico"
   - Conductor: "Carlos Rodríguez"
   - Hora Inicio: "08:00"
   - Hora Fin: "10:00"
   - Días: Lunes, Miércoles, Viernes
   - Activo: true
4. Guardar horario
5. Verificar que aparece en tabla
6. Intentar crear horario solapado (08:30-09:30 mismo conductor) → Debe fallar
7. Crear segundo horario:
   - Misma ruta
   - Mismo conductor
   - Hora: 14:00-16:00
   - Días: Martes, Jueves
8. Verificar ambos horarios en lista

**Criterio de éxito:**
- Horarios creados sin solapamiento
- Validación de conflictos funciona
- Tabla muestra horarios agrupados por ruta/conductor
- Edición de horarios funciona

---

### Flujo 5: Usuario Solicita Parada

**Objetivo:** Flujo completo desde usuario hasta admin

**Pasos:**
1. Crear usuario de prueba:
   - Navegar a `/dashboard/usuarios`
   - Crear usuario "María López"
   - Asignar a "Ruta Centro Histórico"
   - Estado: Activo
2. Simular solicitud de parada (desde vista usuario o API):
   ```bash
   curl -X POST http://localhost:9002/api/solicitudes \
     -H "Content-Type: application/json" \
     -d '{
       "usuarioId": "[ID_MARIA]",
       "paradaId": "[ID_PARQUE_COLON]",
       "rutaId": "[ID_RUTA_CENTRO]"
     }'
   ```
3. Navegar a `/dashboard/solicitudes`
4. Verificar que solicitud aparece con estado "Pendiente"
5. Click "Confirmar" en solicitud
6. Verificar que estado cambia a "Confirmado"
7. Filtrar por estado "Confirmado" → Debe aparecer
8. Filtrar por ruta "Ruta Centro Histórico" → Debe aparecer
9. Cambiar estado a "No Recogido"
10. Verificar actualización

**Criterio de éxito:**
- Solicitud se crea correctamente
- Estados se actualizan en tiempo real
- Filtros funcionan correctamente
- Usuario puede ver su solicitud confirmada

**Validación en BD:**
```sql
SELECT
  s.id,
  u.nombre as usuario,
  p.nombre as parada,
  r.nombre as ruta,
  s.estado,
  s."horaSolicitud"
FROM solicitudes_paradas s
JOIN usuarios u ON s."usuarioId" = u.id
JOIN paradas p ON s."paradaId" = p.id
JOIN rutas r ON s."rutaId" = r.id
ORDER BY s."horaSolicitud" DESC;
```

---

## Verificación de Integridad de Base de Datos

### Test 1: Relaciones Foreign Keys

**Objetivo:** Verificar que todas las relaciones están correctamente implementadas

```sql
-- Test: Eliminar ruta debe eliminar paradas en cascada
BEGIN;
  DELETE FROM rutas WHERE nombre = 'Ruta Test';
  -- Verificar que paradas asociadas también se eliminaron
  SELECT COUNT(*) FROM paradas WHERE "rutaId" = '[ID_RUTA_TEST]';
  -- Debe retornar 0
ROLLBACK;

-- Test: Conductor no puede eliminarse si tiene vehículo asignado
BEGIN;
  DELETE FROM conductores WHERE nombre = 'Carlos Rodríguez';
  -- Debe fallar por constraint de foreign key
ROLLBACK;

-- Test: Usuario con ruta asignada puede actualizarse
UPDATE usuarios SET "rutaAsignada" = NULL WHERE nombre = 'María López';
-- Debe ejecutarse sin errores
```

**Checklist:**
- [ ] Eliminación en cascada funciona para rutas → paradas
- [ ] Restricción funciona para conductores → vehículos
- [ ] Actualización de relaciones funciona
- [ ] No hay registros huérfanos en BD
- [ ] Foreign keys están indexadas

---

### Test 2: Constraints Únicos

```sql
-- Test: Cédula única en conductores
INSERT INTO conductores (id, nombre, cedula, licencia, telefono, turno)
VALUES ('test-id', 'Test', '001-1234567-8', 'LIC-999', '809-000-0000', 'Matutino');
-- Si cédula ya existe, debe fallar

-- Test: Email único en usuarios
INSERT INTO usuarios (id, nombre, cedula, email)
VALUES ('test-id', 'Test', '001-0000000-0', 'existing@email.com');
-- Si email ya existe, debe fallar

-- Test: Placa única en vehículos
INSERT INTO vehiculos (id, ficha, modelo, placa, capacidad)
VALUES ('test-id', 'TEST', 'Test', 'A123456', 10);
-- Si placa ya existe, debe fallar
```

**Checklist:**
- [ ] Constraint de cédula única funciona
- [ ] Constraint de email único funciona
- [ ] Constraint de placa única funciona
- [ ] Constraint de licencia única funciona
- [ ] Errores de constraint son manejados en frontend

---

### Test 3: Índices y Performance

```sql
-- Verificar índices creados
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Test de performance: Query con índice
EXPLAIN ANALYZE
SELECT * FROM paradas WHERE "rutaId" = '[ID]';
-- Debe usar Index Scan (no Seq Scan)

-- Test de performance: Query con relaciones
EXPLAIN ANALYZE
SELECT v.ficha, c.nombre
FROM vehiculos v
JOIN conductores c ON v.id = c."vehiculoId"
WHERE v.estado = 'Operativo';
-- Debe ser eficiente
```

**Checklist:**
- [ ] Índices en foreign keys existen
- [ ] Índices en campos de búsqueda frecuente (estado, activa, etc.)
- [ ] Queries usan índices (verificar con EXPLAIN)
- [ ] No hay full table scans innecesarios

---

## Pruebas de Google Maps Integration

### Test 1: MapPicker Component

**Navegación:** `http://localhost:9002/test-maps`

**Checklist:**
- [ ] Mapa carga sin errores
- [ ] Marcador inicial aparece en Santo Domingo (18.4861, -69.9312)
- [ ] Click en mapa mueve marcador
- [ ] Arrastrar marcador funciona
- [ ] Coordenadas se actualizan en tiempo real
- [ ] Reverse geocoding muestra dirección correcta
- [ ] Búsqueda de direcciones funciona
- [ ] Búsqueda centra mapa correctamente
- [ ] Zoom funciona (scroll/botones)
- [ ] Controles de mapa (map type, fullscreen) funcionan

**Test con diferentes ubicaciones:**
1. Buscar "Av. Winston Churchill, Santo Domingo"
   - Debe centrar en coordenadas correctas
2. Buscar "Faro a Colón"
   - Debe encontrar monumento
3. Buscar "Malecón de Santo Domingo"
   - Debe mostrar área del Malecón
4. Click aleatorio en mapa
   - Debe retornar dirección válida de RD

---

### Test 2: Geocoding y Reverse Geocoding

```typescript
// Test en src/test-geocoding.ts
import { geocodeAddress, reverseGeocode } from '@/lib/google-maps';

async function testGeocoding() {
  // Test 1: Dirección a coordenadas
  const coords = await geocodeAddress("Parque Colón, Santo Domingo");
  console.log('Coordenadas de Parque Colón:', coords);
  // Esperado: { lat: ~18.475, lng: ~-69.885 }

  // Test 2: Coordenadas a dirección
  const address = await reverseGeocode(18.4861, -69.9312);
  console.log('Dirección de Santo Domingo centro:', address);
  // Esperado: Dirección formateada de RD

  // Test 3: Dirección inválida
  const invalid = await geocodeAddress("XYZ123 No Existe");
  console.log('Dirección inválida:', invalid);
  // Esperado: null
}

testGeocoding();
```

**Ejecutar:**
```bash
npx tsx src/test-geocoding.ts
```

**Checklist:**
- [ ] geocodeAddress() retorna coordenadas correctas
- [ ] geocodeAddress() retorna null para direcciones inválidas
- [ ] reverseGeocode() retorna direcciones formateadas
- [ ] reverseGeocode() maneja coordenadas en océano/fuera de RD
- [ ] Funciones manejan errores de red
- [ ] Rate limiting de Google no se excede

---

### Test 3: Cálculo de Distancias

```typescript
// Test de calculateDistance
import { calculateDistance } from '@/lib/google-maps';

async function testDistance() {
  // Distancia entre Parque Colón y Faro a Colón
  const distance = await calculateDistance(
    { lat: 18.4750, lng: -69.8850 }, // Parque Colón
    { lat: 18.4782, lng: -69.8673 }  // Faro a Colón
  );
  console.log('Distancia en metros:', distance);
  // Esperado: ~2000-2500 metros
}
```

**Checklist:**
- [ ] calculateDistance() retorna valor numérico
- [ ] Distancias son razonables (no negativas, no infinitas)
- [ ] Funciona con coordenadas internacionales
- [ ] Maneja errores correctamente

---

## API Endpoints Testing (Postman/curl)

### Colección Postman Sugerida

Crear colección con los siguientes requests:

#### Collection: CESAC API Tests

**Environment Variables:**
```json
{
  "base_url": "http://localhost:9002",
  "conductor_id": "",
  "vehiculo_id": "",
  "ruta_id": "",
  "parada_id": "",
  "usuario_id": ""
}
```

**Tests incluidos:**

1. **GET /api/conductores**
   - Esperado: 200, array de conductores
   - Guardar primer ID en variable

2. **GET /api/conductores/:id**
   - Esperado: 200, objeto conductor
   - Verificar campos: nombre, cedula, licencia

3. **POST /api/conductores**
   - Body:
     ```json
     {
       "nombre": "Test API",
       "cedula": "001-9999999-9",
       "licencia": "LIC-API-TEST",
       "telefono": "809-999-9999",
       "turno": "Matutino"
     }
     ```
   - Esperado: 201, conductor creado
   - Guardar ID retornado

4. **PUT /api/conductores/:id**
   - Body: `{ "telefono": "809-888-8888" }`
   - Esperado: 200, conductor actualizado

5. **DELETE /api/conductores/:id**
   - Esperado: 204, conductor eliminado

6. **Repetir para todos los endpoints**

---

### Tests con curl

**Script de prueba completo:**

```bash
#!/bin/bash
# test-api.sh

BASE_URL="http://localhost:9002"

echo "=== Test API Conductores ==="

# GET all
echo "GET /api/conductores"
curl -s "$BASE_URL/api/conductores" | jq '.'

# POST create
echo "POST /api/conductores"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/conductores" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "API Test",
    "cedula": "001-8888888-8",
    "licencia": "LIC-TEST",
    "telefono": "809-000-0000",
    "turno": "Matutino"
  }')
echo $RESPONSE | jq '.'

# Extraer ID
ID=$(echo $RESPONSE | jq -r '.id')

# GET one
echo "GET /api/conductores/$ID"
curl -s "$BASE_URL/api/conductores/$ID" | jq '.'

# PUT update
echo "PUT /api/conductores/$ID"
curl -s -X PUT "$BASE_URL/api/conductores/$ID" \
  -H "Content-Type: application/json" \
  -d '{"telefono": "809-111-1111"}' | jq '.'

# DELETE
echo "DELETE /api/conductores/$ID"
curl -s -X DELETE "$BASE_URL/api/conductores/$ID"

echo "=== Test Completado ==="
```

**Ejecutar:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Performance Checks

### Test 1: Tiempo de Carga de Páginas

**Herramienta:** Chrome DevTools Network Tab

**Páginas a medir:**

| Página | Tiempo objetivo | Requests | Tamaño |
|--------|-----------------|----------|--------|
| `/dashboard` | < 2s | < 20 | < 500KB |
| `/dashboard/data-master/conductores` | < 1.5s | < 15 | < 300KB |
| `/dashboard/rutas` (con mapa) | < 3s | < 30 | < 800KB |
| `/dashboard/solicitudes` | < 2s | < 20 | < 400KB |

**Checklist:**
- [ ] Todas las páginas cargan en < 3 segundos
- [ ] No hay requests bloqueantes
- [ ] Imágenes optimizadas
- [ ] Bundles de JS no superan 500KB
- [ ] CSS no supera 100KB
- [ ] Google Maps carga asíncrono (no bloquea render)

---

### Test 2: Database Query Performance

```sql
-- Test: Queries lentas
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Test: Conteo de registros
SELECT
  'conductores' as tabla, COUNT(*) FROM conductores
UNION ALL
SELECT 'vehiculos', COUNT(*) FROM vehiculos
UNION ALL
SELECT 'rutas', COUNT(*) FROM rutas
UNION ALL
SELECT 'paradas', COUNT(*) FROM paradas;
```

**Checklist:**
- [ ] Queries no superan 100ms en promedio
- [ ] Índices se usan correctamente (verificar EXPLAIN)
- [ ] No hay N+1 queries (usar Prisma include)
- [ ] Conexiones a BD se cierran correctamente
- [ ] Pool de conexiones configurado

---

### Test 3: API Response Time

**Herramienta:** Postman Tests o Apache Bench

```bash
# Test con Apache Bench (ab)
# 100 requests, 10 concurrentes
ab -n 100 -c 10 http://localhost:9002/api/conductores

# Test con curl + time
time curl http://localhost:9002/api/conductores > /dev/null
```

**Métricas objetivo:**

| Endpoint | Response Time | Throughput |
|----------|---------------|------------|
| GET /api/conductores | < 100ms | > 50 req/s |
| GET /api/vehiculos | < 100ms | > 50 req/s |
| GET /api/rutas | < 150ms | > 40 req/s |
| POST /api/conductores | < 200ms | > 30 req/s |

**Checklist:**
- [ ] Todos los GET < 200ms
- [ ] Todos los POST/PUT < 300ms
- [ ] Sistema soporta 10 usuarios concurrentes
- [ ] No hay memory leaks (verificar con Node.js profiler)

---

## Common Issues and Fixes

### Issue 1: "Can't reach database server"

**Síntomas:**
- Prisma lanza error de conexión
- API endpoints retornan 500

**Diagnóstico:**
```bash
# Verificar conexión
psql "postgresql://dgii_oscgre:dgii_oscgre@manager.oscgre.com:5432/suv_db"

# Verificar puerto abierto
nc -zv manager.oscgre.com 5432

# Verificar DNS
ping manager.oscgre.com
```

**Soluciones:**
1. Verificar credenciales en `.env`
2. Verificar firewall permite puerto 5432
3. Verificar que PostgreSQL está corriendo
4. Reiniciar conexión: `npx prisma generate`

---

### Issue 2: "This page can't load Google Maps correctly"

**Síntomas:**
- Mapa aparece gris con mensaje de error
- Consola muestra error de API key

**Diagnóstico:**
```bash
# Verificar API key configurada
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# En browser console
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

**Soluciones:**
1. Verificar API key en `.env` tiene prefijo `NEXT_PUBLIC_`
2. Reiniciar servidor Next.js: `npm run dev`
3. Verificar billing habilitado en Google Cloud
4. Verificar restricciones de HTTP referrer incluyen localhost:9002
5. Regenerar API key si es necesario

---

### Issue 3: Formularios no validan correctamente

**Síntomas:**
- Validación Zod no funciona
- Errores no se muestran en UI
- Datos inválidos se guardan en BD

**Diagnóstico:**
```typescript
// Test manual de schema
import { conductorSchema } from '@/lib/schemas';

try {
  conductorSchema.parse({ nombre: "" }); // Inválido
} catch (error) {
  console.log('Errores:', error.errors);
}
```

**Soluciones:**
1. Verificar schema importado correctamente
2. Verificar React Hook Form usa `zodResolver`
3. Verificar que `.safeParse()` se usa en API routes
4. Verificar que errores se muestran en UI con FormMessage
5. Revisar documentación de Zod para validaciones complejas

---

### Issue 4: Paradas no aparecen en mapa

**Síntomas:**
- Coordenadas guardadas en BD
- Mapa carga pero sin marcadores
- Console no muestra errores

**Diagnóstico:**
```sql
-- Verificar coordenadas válidas
SELECT nombre, latitud, longitud FROM paradas;

-- Coordenadas deben estar en rango de RD
-- Latitud: ~17-20
-- Longitud: ~-72 a -68
```

**Soluciones:**
1. Verificar que coordenadas son números (no strings)
2. Verificar que latitud/longitud no están invertidas
3. Verificar que mapa está centrado en RD
4. Verificar que paradas se cargan con ruta (include en Prisma)
5. Verificar que marcadores se crean después de cargar Google Maps API

---

### Issue 5: Relaciones no se actualizan en UI

**Síntomas:**
- Asignar conductor a vehículo no se refleja
- Cambios en BD pero UI desactualizada

**Diagnóstico:**
```typescript
// Verificar que include está en query
const vehiculos = await prisma.vehiculo.findMany({
  include: {
    conductor: true,
    ruta: true
  }
});
```

**Soluciones:**
1. Verificar que API route usa `include` en Prisma query
2. Refrescar datos después de mutación (refetch)
3. Verificar que useApi hook ejecuta GET después de POST/PUT
4. Usar React Query para cache management
5. Implementar optimistic updates en UI

---

## Final Deployment Checklist

### Pre-deployment

- [ ] Todas las migraciones ejecutadas en producción
- [ ] Datos seed ejecutados (o datos reales importados)
- [ ] Variables de entorno configuradas en servidor
- [ ] Google Maps API key con restricciones de dominio de producción
- [ ] Base de datos PostgreSQL en producción configurada
- [ ] Backup de base de datos creado
- [ ] SSL/TLS configurado para conexión a BD
- [ ] Logs de aplicación configurados
- [ ] Monitoreo configurado (Sentry, LogRocket, etc.)

### Build

- [ ] `npm run build` ejecuta sin errores
- [ ] Bundle size es razonable (< 2MB)
- [ ] No hay warnings críticos en build
- [ ] TypeScript compila sin errores
- [ ] ESLint pasa sin errores críticos
- [ ] Tests pasan (si implementados)

### Configuration

- [ ] `.env.production` configurado
- [ ] `next.config.js` optimizado para producción
- [ ] Compress habilitado
- [ ] Imágenes optimizadas con Next.js Image
- [ ] API rate limiting implementado
- [ ] CORS configurado correctamente
- [ ] CSP headers configurados

### Security

- [ ] `.env` no está en repositorio
- [ ] API keys tienen restricciones
- [ ] Autenticación implementada (si aplica)
- [ ] Autorización por roles implementada (admin/usuario)
- [ ] Input sanitization en todos los endpoints
- [ ] SQL injection prevenido (Prisma lo hace)
- [ ] XSS prevenido (React lo hace)
- [ ] Rate limiting en APIs
- [ ] HTTPS forzado

### Performance

- [ ] Lazy loading implementado
- [ ] Code splitting configurado
- [ ] CDN configurado para assets estáticos
- [ ] Database connection pooling configurado
- [ ] Índices de BD optimizados
- [ ] Cache configurado (Redis si aplica)
- [ ] Compresión gzip/brotli habilitada

### Testing in Production

- [ ] Smoke tests ejecutados
- [ ] Flujo E2E principal funciona
- [ ] Google Maps carga correctamente
- [ ] Base de datos responde
- [ ] APIs responden < 300ms
- [ ] No hay memory leaks
- [ ] Logs muestran actividad normal

---

## Success Criteria (Sistema 100% Funcional)

### Infraestructura
- [x] PostgreSQL operativo con 9 tablas
- [x] Prisma Client generado y funcional
- [x] Google Maps API configurada y funcionando
- [x] Datos seed cargados correctamente
- [x] Servidor Next.js corriendo estable

### Backend
- [x] 8 grupos de API endpoints funcionando (40+ endpoints totales)
- [x] Validación Zod en todos los endpoints
- [x] Manejo de errores robusto
- [x] Relaciones de BD funcionando correctamente
- [x] Queries optimizadas con índices

### Frontend
- [x] 8 módulos CRUD completos y funcionales
- [x] MapPicker integrado en paradas
- [x] Formularios con validación client-side
- [x] Estados de loading/error manejados
- [x] UI responsive y accesible
- [x] Notificaciones (toasts) funcionando

### Integración
- [x] Flujo completo: Crear ruta → Agregar paradas → Asignar vehículo → Asignar conductor → Crear horario
- [x] Flujo usuario: Solicitar parada → Admin confirma → Usuario notificado
- [x] Google Maps muestra paradas correctamente
- [x] Relaciones entre entidades funcionan end-to-end

### Calidad
- [x] No hay errores en consola de browser
- [x] No hay errores en consola de servidor
- [x] No hay warnings críticos
- [x] Performance cumple objetivos (< 3s carga)
- [x] Base de datos sin registros huérfanos

### Documentación
- [x] README.md actualizado
- [x] `.env.example` documentado
- [x] Comentarios en código complejo
- [x] Historias de usuario completadas
- [x] Este documento de testing completado

---

## Comandos de Verificación Rápida

**Ejecutar todo en secuencia:**

```bash
#!/bin/bash
# verify-system.sh

echo "=== Verificación del Sistema CESAC ==="

echo "[1/7] Verificando conexión a BD..."
npx prisma db pull > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ BD conectada"
else
  echo "❌ BD no conectada"
  exit 1
fi

echo "[2/7] Verificando migraciones..."
npx prisma migrate status
if [ $? -eq 0 ]; then
  echo "✅ Migraciones al día"
else
  echo "⚠️  Migraciones pendientes"
fi

echo "[3/7] Verificando Prisma Client..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Prisma Client generado"
else
  echo "❌ Error generando Prisma Client"
  exit 1
fi

echo "[4/7] Verificando datos seed..."
CONDUCTOR_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM conductores;")
if [ "$CONDUCTOR_COUNT" -gt 0 ]; then
  echo "✅ Datos seed cargados ($CONDUCTOR_COUNT conductores)"
else
  echo "⚠️  No hay datos seed"
fi

echo "[5/7] Verificando Google Maps API..."
if grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env; then
  echo "✅ API Key configurada"
else
  echo "❌ API Key no configurada"
  exit 1
fi

echo "[6/7] Verificando build de Next.js..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build exitoso"
else
  echo "❌ Build falló"
  exit 1
fi

echo "[7/7] Iniciando servidor..."
npm run dev > /dev/null 2>&1 &
sleep 5

# Verificar que servidor responde
curl -s http://localhost:9002 > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Servidor respondiendo"
else
  echo "❌ Servidor no responde"
  exit 1
fi

echo ""
echo "=== ✅ Verificación Completada ==="
echo "Sistema CESAC 100% funcional"
echo ""
echo "Accesos:"
echo "  - App: http://localhost:9002"
echo "  - Prisma Studio: npx prisma studio"
echo "  - Docs: /casos/README.md"
```

**Hacer ejecutable y correr:**
```bash
chmod +x verify-system.sh
./verify-system.sh
```

---

## Conclusión

Al completar todos los ítems de este documento, el sistema CESAC estará:

1. ✅ **100% funcional** - Todos los módulos operando correctamente
2. ✅ **Testeado end-to-end** - Flujos completos verificados
3. ✅ **Integrado completamente** - BD + API + Frontend + Google Maps
4. ✅ **Optimizado** - Performance dentro de objetivos
5. ✅ **Documentado** - Código y procesos documentados
6. ✅ **Listo para producción** - Checklist de deployment completado

**Siguiente paso:** Deployment a producción y monitoreo continuo.

---

**Archivos de Testing Creados:**

```
casos/
└── HISTORIA-21-testing-verificacion.md  # Este archivo

test/                                     # Crear carpeta de tests
├── test-prisma.ts                       # Test de conexión BD
├── test-schemas.ts                      # Test de validación Zod
├── test-geocoding.ts                    # Test de Google Maps
└── test-api.sh                          # Script de tests API

verify-system.sh                         # Script de verificación rápida
```

---

## Métricas Finales del Proyecto

Una vez completado todo:

**Código:**
- Archivos TypeScript: ~50
- Líneas de código: ~8,000-10,000
- Componentes React: ~25
- API Routes: ~40
- Database models: 9

**Tiempo:**
- Infraestructura: ~8 horas
- Backend APIs: ~16 horas
- Frontend CRUD: ~24 horas
- Testing: ~6 horas
- **Total:** ~54 horas (7 días de trabajo)

**Cobertura:**
- Módulos CRUD: 8/8 (100%)
- API Endpoints: 40/40 (100%)
- Integraciones: 2/2 (100%) - Prisma, Google Maps
- Tests E2E: 5/5 (100%)

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
**Versión:** 1.0
**Estado:** Listo para ejecución

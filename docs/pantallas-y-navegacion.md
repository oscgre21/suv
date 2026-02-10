# Pantallas y Navegación

**Documentación del Sistema de Ubicación Vehicular CESAC**
**Versión 1.0** | **Última actualización:** Febrero 2025

---

## Índice

1. [Estructura de Rutas](#estructura-de-rutas)
2. [Layouts del Sistema](#layouts-del-sistema)
3. [Dashboard Administrativo](#dashboard-administrativo)
4. [Vista Móvil de Usuario](#vista-móvil-de-usuario)
5. [Vista del Conductor](#vista-del-conductor)
6. [Diagrama de Navegación](#diagrama-de-navegación)

---

## Estructura de Rutas

El sistema CESAC cuenta con **26 páginas** distribuidas en 3 interfaces principales:

### Login y Acceso

| Ruta | Archivo | Descripción | Acceso |
|------|---------|-------------|--------|
| `/` | [app/page.tsx](../src/app/page.tsx) | Página de login con email/contraseña o modo invitado | Público |

---

### Dashboard Administrativo (15 páginas)

| # | Ruta | Descripción | Componentes Clave |
|---|------|-------------|-------------------|
| 1 | `/dashboard` | Panel de control GPS con mapa en tiempo real | LeafletMap, Cards, ReportCharts |
| 2 | `/dashboard/solicitudes` | Solicitudes y paradas por ruta (tabs) | Tabs, Table, Badge |
| 3 | `/dashboard/rutas` | Gestión de rutas (CRUD completo) | Dialog, Form, Table |
| 4 | `/dashboard/usuarios` | Gestión de usuarios y asignaciones | Table, Select, Button |
| 5 | `/dashboard/choferes-y-vehiculos` | Gestión de choferes y flota | DriverProfileCard, Table |
| 6 | `/dashboard/reportes` | Reportes con gráficos | ReportCharts (Recharts) |
| 7 | `/dashboard/configuracion` | Preferencias del sistema | Form, Switch |
| 8 | `/dashboard/perfil` | Perfil del administrador | Avatar, Form |
| 9 | `/dashboard/usuario` | Preview de vista móvil en dashboard | iframe/embed de /usuario |
| 10 | `/dashboard/data-master` | Hub central con 5 módulos | AnimatedCard, Grid |
| 11 | `/dashboard/data-master/conductores` | CRUD de conductores | Table, Dialog, Form |
| 12 | `/dashboard/data-master/rutas` | CRUD de rutas | Table, Dialog, Form |
| 13 | `/dashboard/data-master/vehiculos` | CRUD de vehículos | Table, Dialog, Form |
| 14 | `/dashboard/data-master/estatus-vehiculo` | CRUD de estados de vehículo | Table, Dialog, Badge |
| 15 | `/dashboard/data-master/rutas-especiales` | CRUD de rutas especiales | Table, Dialog, Form |

---

### Vista Móvil de Usuario (5 páginas)

| # | Ruta | Descripción | Componentes Clave |
|---|------|-------------|-------------------|
| 1 | `/usuario` | Home con mapa, selección de bus, notificación | AnimatedMap, Select, Countdown |
| 2 | `/usuario/horarios` | Horarios por ruta con tracking PGA | Accordion, AlertDialog |
| 3 | `/usuario/historial` | Lista de viajes realizados | Table, Badge |
| 4 | `/usuario/historial/[id]` | Detalle de viaje específico | Card, Map (estático) |
| 5 | `/usuario/perfil` | Perfil del usuario | Avatar, Form |

---

### Vista del Conductor (1 página)

| # | Ruta | Descripción | Componentes Clave |
|---|------|-------------|-------------------|
| 1 | `/vista-bus` | Panel de control del conductor en tiempo real | Clock, WeatherWidget, Button |

---

## Layouts del Sistema

### Layout Raíz

**Archivo:** [app/layout.tsx](../src/app/layout.tsx)

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(poppins.className, "antialiased")}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Providers incluidos:**
- `ThemeProvider` (next-themes) - Modo oscuro/claro

---

### Layout del Dashboard

**Archivo:** [dashboard/layout.tsx](../src/app/dashboard/layout.tsx:51-306)

**Estructura visual:**

```
┌────────────────────────────────────────────────────────┐
│ SidebarProvider                                        │
│ ┌──────────────┬───────────────────────────────────┐  │
│ │              │                                   │  │
│ │  Sidebar     │  SidebarInset                     │  │
│ │              │                                   │  │
│ │ ┌──────────┐ │ ┌───────────────────────────────┐ │  │
│ │ │ Logo     │ │ │ Header                        │ │  │
│ │ │ CESAC    │ │ │ ┌─────────────────────────┐   │ │  │
│ │ └──────────┘ │ │ │ SidebarTrigger (mobile) │   │ │  │
│ │              │ │ │ Page Title              │   │ │  │
│ │ Navigation:  │ │ │ ThemeToggle             │   │ │  │
│ │              │ │ │ User Avatar (dropdown)  │   │ │  │
│ │ 🗺️  Monitoreo│ │ └─────────────────────────┘   │ │  │
│ │   • GPS     │ │ │                               │ │  │
│ │   • Solic.  │ │ ┌───────────────────────────────┐ │  │
│ │              │ │ │                               │ │  │
│ │ 🛣️  Rutas   │ │ │  Main Content                │ │  │
│ │              │ │ │  (children)                  │ │  │
│ │ 👥 Gestión  │ │ │                               │ │  │
│ │   • Usuarios│ │ │                               │ │  │
│ │   • Choferes│ │ │                               │ │  │
│ │              │ │ │                               │ │  │
│ │ 📊 Reportes │ │ │                               │ │  │
│ │              │ │ └───────────────────────────────┘ │  │
│ │ ⚙️  Config   │ │ ┌───────────────────────────────┐ │  │
│ │   • Preferen│ │ │ Footer                        │ │  │
│ │   • DataMast│ │ │ © 2025 CESAC - by Kendy       │ │  │
│ │   • Vista U │ │ └───────────────────────────────┘ │  │
│ │   • Vista B │ │                                   │  │
│ │              │ │                                   │  │
│ │ 🚪 Logout   │ │                                   │  │
│ └──────────────┘ └───────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

#### Navegación del Sidebar

**Items del menú:**

1. **Monitoreo** (collapsible)
   - Panel de Control GPS (`/dashboard`)
   - Solicitudes y Paradas (`/dashboard/solicitudes`)

2. **Gestión de Rutas** (`/dashboard/rutas`)

3. **Gestión** (collapsible)
   - Usuarios (`/dashboard/usuarios`)
   - Choferes y Vehículos (`/dashboard/choferes-y-vehiculos`)

4. **Reportes** (`/dashboard/reportes`)

5. **Configuración** (collapsible)
   - Preferencias (`/dashboard/configuracion`)
   - Data Master (`/dashboard/data-master`)
   - Vista Usuario (`/dashboard/usuario`)
   - Vista del Bus (`/vista-bus`)

6. **Cerrar Sesión** (footer) - Abre LogoutDialog

#### Header del Dashboard

**Componentes:**

```tsx
<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
  <SidebarTrigger className="md:hidden" />
  <div className="flex-1 font-bold text-xl">{pageTitle}</div>
  <ThemeToggle />
  <DropdownMenu>
    {/* Avatar del usuario */}
  </DropdownMenu>
</header>
```

**Dropdown de Usuario:**
- Configuración → `/dashboard/configuracion`
- Perfil → `/dashboard/perfil`
- Vista Usuario (nueva pestaña) → `/usuario`
- Código QR Vista Usuario → QrCodeDialog
- Cerrar Sesión → LogoutDialog

**Función de título dinámico:**

```typescript
// dashboard/layout.tsx:74-87
const getPageTitle = (path: string) => {
  if (path === '/dashboard') return 'Panel de control GPS';
  if (path.startsWith('/dashboard/solicitudes')) return 'Solicitudes y Paradas';
  if (path.startsWith('/dashboard/rutas')) return 'Gestión de Rutas';
  if (path.startsWith('/dashboard/usuarios')) return 'Gestión de Usuarios';
  if (path.startsWith('/dashboard/choferes-y-vehiculos')) return 'Choferes y Vehículos';
  if (path.startsWith('/dashboard/reportes')) return 'Reportes';
  if (path.startsWith('/dashboard/configuracion')) return 'Configuración';
  if (path.startsWith('/dashboard/data-master')) return 'Data Master';
  if (path.startsWith('/dashboard/perfil')) return 'Perfil de Usuario';
  if (path.startsWith('/dashboard/usuario')) return 'Vista Previa de Usuario';
  return '';
}
```

---

### Layout de Usuario Móvil

**Archivo:** [usuario/layout.tsx](../src/app/usuario/layout.tsx)

**Estructura visual:**

```
┌────────────────────────────┐
│ UsuarioProvider            │
│                            │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │  Main Content          │ │
│ │  (children)            │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ Bottom Navigation      │ │
│ │                        │ │
│ │  🏠    📅    📜    👤  │ │
│ │ Inicio Hor.  Hist. Per.│ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

**Bottom Navigation:**

| Icono | Texto | Ruta | Activo cuando |
|-------|-------|------|---------------|
| 🏠 Home | Inicio | `/usuario` | `pathname === '/usuario'` |
| 📅 Calendar | Horarios | `/usuario/horarios` | `pathname === '/usuario/horarios'` |
| 📜 History | Historial | `/usuario/historial` | `pathname.startsWith('/usuario/historial')` |
| 👤 User | Perfil | `/usuario/perfil` | `pathname === '/usuario/perfil'` |

**Provider Context:**

El layout envuelve todo en `UsuarioProvider`, que proporciona:
- Estado de buses
- Lógica de notificación
- Sistema de penalización
- Countdown y alertas

---

## Dashboard Administrativo

### 1. /dashboard - Panel de Control GPS

**Archivo:** [dashboard/page.tsx](../src/app/dashboard/page.tsx)

**Componentes principales:**

```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Buses Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
          </CardContent>
        </Card>
        {/* + 3 cards más: Rutas operativas, Solicitudes, Puntualidad */}
      </div>

      {/* Mapa interactivo */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoreo en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <LeafletMap />
        </CardContent>
      </Card>

      {/* Gráfico de frecuencia */}
      <Card>
        <CardHeader>
          <CardTitle>Frecuencia de Uso por Ruta</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportCharts type="bar" />
        </CardContent>
      </Card>

      {/* Tabla de estado de buses */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Buses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            {/* Filas con buses en tiempo real */}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Métricas mostradas:**
- **Buses Activos:** 12 (con ícono Bus)
- **Rutas Operativas:** 4 (con ícono Route)
- **Solicitudes Pendientes:** 8 (con ícono Bell)
- **Puntualidad:** 96.5% (con ícono BarChart3)

---

### 2. /dashboard/solicitudes - Solicitudes y Paradas

**Componentes:**
- `Tabs` con 4 pestañas (una por ruta)
- `Table` con solicitudes por ruta
- `Badge` para estados (Confirmado, No recogido, Cancelado)
- `Button` para acciones

**Estados de solicitud:**
- ✅ **Confirmado** (verde)
- ❌ **No recogido** (rojo)
- ⛔ **Cancelado** (gris)

---

### 3. /dashboard/rutas - Gestión de Rutas

**Funcionalidades:**
- CRUD completo de rutas
- Agregar/editar/eliminar paradas
- Asignar conductores y vehículos
- Activar/desactivar rutas
- Configurar horarios

**Rutas principales:**
1. Charles de Gaulle (15 paradas)
2. Autopista Duarte (12 paradas)
3. Independencia (18 paradas)
4. 27 de Febrero (22 paradas - inactiva)

---

### 4. /dashboard/usuarios - Gestión de Usuarios

**Funcionalidades:**
- Tabla con todos los usuarios
- Agregar nuevos usuarios
- Asignar rutas
- Exportar datos (Excel/PDF)
- Filtros y búsqueda

**Columnas de tabla:**
- ID
- Nombre
- Cédula
- Email
- Ruta Asignada
- Estado (Activo/Inactivo)
- Acciones

---

### 5. /dashboard/choferes-y-vehiculos

**Tabs:**
1. **Choferes**
   - DriverProfileCard (expandible)
   - Turno (Matutino/Vespertino/Nocturno)
   - Vehículo asignado
   - Estado (Activo/Vacaciones/Inactivo)

2. **Vehículos**
   - Table con fichas
   - Modelo, año, capacidad
   - Estado mecánico (badge)
   - Próximo mantenimiento

---

### 6. /dashboard/reportes - Reportes

**Gráficos incluidos:**

1. **Puntualidad por Ruta** (Radial Chart)
```tsx
<ReportCharts type="radial" />
```

2. **Tiempos Promedio de Recorrido** (Line Chart)
```tsx
<ReportCharts type="line" />
```

3. **Frecuencia de Uso** (Bar Chart)
```tsx
<ReportCharts type="bar" />
```

**Librería:** Recharts 2.15.1

---

### 7. /dashboard/configuracion - Preferencias

**Opciones:**
- Notificaciones push
- Sonidos del sistema
- Idioma (solo español por ahora)
- Zona horaria
- Unidades de medida

---

### 8. /dashboard/perfil - Perfil de Usuario

**Secciones:**
- Información personal
- Avatar
- Cambiar contraseña
- Preferencias de notificación

---

### 9. /dashboard/usuario - Vista Previa

**Propósito:** Preview de la vista móvil dentro del dashboard

**Implementación:** Muestra `/usuario` en un contenedor con padding 0

```tsx
// dashboard/layout.tsx:292-295
<main className={cn(
  "flex-1 overflow-y-auto",
  isUsuarioPage ? "p-0" : "p-4 sm:p-6"
)}>
```

---

### 10. /dashboard/data-master - Hub Central

**Archivo:** [dashboard/data-master/page.tsx](../src/app/dashboard/data-master/page.tsx)

**Componentes:**
- Grid de 5 `AnimatedCard` con efecto glow 3D
- Cada card enlaza a un submódulo

**Estructura:**

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <AnimatedCard href="/dashboard/data-master/conductores" glowClassName="from-blue-500/20">
    <Route className="h-8 w-8" />
    <CardTitle>Conductores</CardTitle>
  </AnimatedCard>

  <AnimatedCard href="/dashboard/data-master/rutas" glowClassName="from-green-500/20">
    {/* Rutas */}
  </AnimatedCard>

  {/* + 3 más: Vehículos, Estatus, Rutas Especiales */}
</div>
```

#### 10.1. /dashboard/data-master/conductores

**CRUD de conductores:**
- Nombre, cédula, licencia
- Turno (Matutino/Vespertino/Nocturno)
- Vehículo asignado
- Foto (opcional)
- Estado

#### 10.2. /dashboard/data-master/rutas

**CRUD de rutas:**
- Nombre de ruta
- Paradas (array)
- Color en mapa
- Activa/Inactiva
- Horarios

#### 10.3. /dashboard/data-master/vehiculos

**CRUD de vehículos:**
- Ficha/ID
- Placa
- Modelo y año
- Capacidad
- Estado mecánico

#### 10.4. /dashboard/data-master/estatus-vehiculo

**CRUD de estados:**
- Nombre del estado
- Descripción
- Color (clase CSS)
- Ícono

**Estados predefinidos:**
- 🟢 Operativo
- 🔧 En Taller
- 🔴 Fuera de Servicio
- ⏸️ En Espera

#### 10.5. /dashboard/data-master/rutas-especiales

**CRUD de rutas especiales:**
- Nombre del evento
- Descripción
- Fecha inicio/fin
- Paradas personalizadas
- Motivo (Evento, Mantenimiento, etc.)
- Status (Programada, Completada, Cancelada)

---

## Vista Móvil de Usuario

### 1. /usuario - Inicio

**Archivo:** [usuario/page.tsx](../src/app/usuario/page.tsx)

**Flujo de interfaz:**

```
┌─────────────────────────────────────┐
│ AnimatedMap (ubicación animada)     │
│ (mapa decorativo sin interacción)   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Hola, Usuario 👋                    │
│ 📍 Tu ubicación actual              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Selecciona tu Bus:                  │
│ ┌─────────────────────────────────┐ │
│ │ BUSCESAC-1               ▼      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🚌 Estado: En ruta                  │
│ ⏱️  Tiempo estimado: 1 minuto       │
│ 📍 Próxima parada: Cruce Sab. Larga │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ESTADO NORMAL:                      │
│ ┌─────────────────────────────────┐ │
│ │ 🔔 Estoy en la parada           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ COUNTDOWN ACTIVO:                   │
│         ╭─────╮                     │
│         │ 0:45│  <- Círculo progreso│
│         ╰─────╯                     │
│ ┌─────────────────────────────────┐ │
│ │ ❌ Cancelar                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PENALIZADO:                         │
│ ┌─────────────────────────────────┐ │
│ │ ⛔ Penalizado (9:45 restantes)  │ │
│ │ (botón deshabilitado)           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ WeatherWidget                       │
│ ☀️ 28°C Soleado                    │
└─────────────────────────────────────┘
```

**Estados del botón de notificación:**

1. **Estado Normal:**
   - Botón: "🔔 Estoy en la parada"
   - Habilitado
   - Al hacer click: ejecuta `handleNotify()`

2. **Countdown Activo:**
   - Componente `Countdown` visible
   - Círculo de progreso con tiempo restante
   - Botón "❌ Cancelar"
   - Sonido de éxito al iniciar

3. **Alerta de Llegada (20 segundos):**
   - `AlertDialog` se muestra
   - Sonido de alerta en loop
   - Mensaje: "¡Bus a punto de llegar!"
   - Al aceptar: detiene sonido

4. **Penalizado:**
   - Botón deshabilitado con ícono ⛔
   - Muestra tiempo restante de penalización
   - Countdown de 10 minutos
   - Sonido de error al aplicar

5. **Encuesta Post-Viaje:**
   - `SurveyDialog` cuando countdown llega a 0
   - Calificación con estrellas
   - Campo de comentarios opcional

**Lógica de detección de tracking:**

```typescript
// usuario-provider.tsx:86-96
useEffect(() => {
    const startTracking = searchParams.get('startTracking');
    const busIdParam = searchParams.get('busId');
    if (startTracking === 'true' && busIdParam) {
        const busExists = buses.some(bus => bus.id === busIdParam);
        if (busExists) {
            setSelectedBusId(busIdParam);
            setTimeout(() => handleNotify(), 0);
        }
    }
}, [searchParams, handleNotify, buses]);
```

---

### 2. /usuario/horarios - Horarios y Tracking

**Archivo:** [usuario/horarios/page.tsx](../src/app/usuario/horarios/page.tsx)

**Componentes:**

```tsx
export default function HorariosPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleTracking = () => {
    setIsAnalyzing(true);
    // Simula análisis PGA por 4 segundos
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        found: true,
        suggestedStop: "Nueva Parada Cercana",
        distance: "250m",
        suggestedBus: "BUSCESAC-2"
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Botón de Tracking */}
      <Button onClick={handleTracking} disabled={isAnalyzing}>
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            PGA Analysis...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Tracking: Encontrar parada más cercana
          </>
        )}
      </Button>

      {/* Accordion de horarios por ruta */}
      <Accordion type="single" collapsible>
        <AccordionItem value="charles">
          <AccordionTrigger>Ruta Charles de Gaulle</AccordionTrigger>
          <AccordionContent>
            {/* Horarios */}
          </AccordionContent>
        </AccordionItem>
        {/* + 3 rutas más */}
      </Accordion>

      {/* AlertDialog de resultado */}
      {analysisResult && (
        <AlertDialog open={!!analysisResult}>
          <AlertDialogContent>
            <AlertDialogTitle>Parada Encontrada</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos {analysisResult.suggestedStop} a {analysisResult.distance}.
              ¿Deseas cambiar a esta parada?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>No, gracias</AlertDialogCancel>
              <AlertDialogAction onClick={handleChangeStop}>
                Sí, cambiar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
```

**Flujo de Tracking PGA:**

1. Usuario presiona "Tracking: Encontrar parada más cercana"
2. Spinner "PGA Analysis..." por 4 segundos
3. Si encuentra parada diferente:
   - Muestra `AlertDialog` con sugerencia
   - Opciones: "No, gracias" o "Sí, cambiar"
4. Si acepta cambiar:
   - Verifica si ya notificó parada actual
   - Si no: redirige con `router.push('/usuario?startTracking=true&busId=X')`
   - Si sí: muestra error "No puedo ejecutar el cambio"

---

### 3. /usuario/historial - Lista de Viajes

**Componentes:**
- `Table` con viajes realizados
- `Badge` para estados (Recogido/No pasó)
- Links a detalle: `/usuario/historial/[id]`

**Columnas:**
- Fecha
- Bus
- Ruta
- Hora Subida
- Parada Subida
- Estado
- Acciones (Ver detalle)

---

### 4. /usuario/historial/[id] - Detalle de Viaje

**Parámetro dinámico:** `id` del viaje

**Información mostrada:**
- Fecha y hora completa
- Bus y conductor
- Parada de subida
- Parada de bajada (si aplica)
- Duración del viaje
- Mapa estático de ruta
- Estado final

---

### 5. /usuario/perfil - Perfil

**Secciones:**
- Avatar del usuario
- Información personal (nombre, cédula, email)
- Ruta asignada
- Historial resumido (últimos 5 viajes)
- Botón de cerrar sesión

---

## Vista del Conductor

### /vista-bus - Panel de Control

**Archivo:** [vista-bus/page.tsx](../src/app/vista-bus/page.tsx)

**Estructura:**

```
┌─────────────────────────────────────────┐
│ ⏰ 14:32:15 (reloj digital grande)      │
│ 🟢 Online / 🔴 Offline                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 👨‍✈️ Manuel Gonzalez                     │
│ 🚗 Ficha 01 - Placa: ABC-123           │
│ 🔔 (Botón sirena)                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ▶️ Iniciar RUTA                         │
│ O (cuando está activa)                  │
│ ⏹️ Finalizar RUTA (1:23:45)            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📍 Próxima Parada:                      │
│ Cruce Sabana Larga                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ CONFIRMAR PARADA                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 👥 Pasajeros recogidos: 12              │
│ 🚏 Paradas solicitadas: 5               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Estado del Bus:                         │
│ ┌───────┐ ┌───────────┐                │
│ │En Ruta│ │Retrasado  │                │
│ └───────┘ └───────────┘                │
│ ┌───────┐ ┌───────────┐                │
│ │Dañado │ │911        │                │
│ └───────┘ └───────────┘                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WeatherWidget                           │
│ ☀️ 28°C Soleado                        │
└─────────────────────────────────────────┘
```

**Estados y Flujos:**

1. **Estado Inicial:**
   - Reloj digital actualizado cada segundo
   - Botón "Iniciar RUTA" habilitado
   - "CONFIRMAR PARADA" deshabilitado

2. **Ruta Activa:**
   - Timer de duración corriendo
   - Botón cambia a "Finalizar RUTA (1:23:45)"
   - "CONFIRMAR PARADA" habilitado
   - Muestra próxima parada

3. **Confirmar Parada:**
   - `playSuccessSound()`
   - Incrementa contador de pasajeros
   - Genera random 2-11 paradas solicitadas
   - Avanza a siguiente parada
   - **TTS anuncia siguiente parada** (Google Genkit)

4. **Finalizar Ruta:**
   - Muestra duración total
   - Resetea contadores
   - Vuelve a estado inicial

**Estados del Bus (botones):**
- 🟢 **En Ruta** (verde) - Operando normalmente
- 🟡 **Retrasado** (amarillo) - Detrás del horario
- 🔴 **Dañado** (rojo) - Problema mecánico
- 🆘 **911** (rojo intenso) - Emergencia

**Integración TTS:**

```typescript
const handleConfirmStop = async () => {
  playSuccessSound();
  setPassengers(prev => prev + Math.floor(Math.random() * 5) + 1);
  setRequestedStops(Math.floor(Math.random() * 10) + 2);

  // Avanzar a siguiente parada
  const nextStop = getNextStop();

  // TTS announcement
  const audio = await generateSpeech(
    `Próxima parada: ${nextStop.nombre}. Prepárense para descender.`
  );
  new Audio(audio.media).play();
};
```

---

## Diagrama de Navegación

```mermaid
graph TB
    subgraph Login
        A[/ - Login]
    end

    subgraph Dashboard["Dashboard Administrativo"]
        D[/dashboard<br/>GPS]
        D1[/solicitudes]
        D2[/rutas]
        D3[/usuarios]
        D4[/choferes-y-vehiculos]
        D5[/reportes]
        D6[/configuracion]
        D7[/perfil]
        D8[/usuario preview]
        DM[/data-master]
    end

    subgraph DataMaster["Data Master Modules"]
        DM1[/conductores]
        DM2[/rutas]
        DM3[/vehiculos]
        DM4[/estatus-vehiculo]
        DM5[/rutas-especiales]
    end

    subgraph Usuario["Vista Móvil Usuario"]
        U[/usuario<br/>Inicio]
        U1[/horarios]
        U2[/historial]
        U2D[/historial/[id]]
        U3[/perfil]
    end

    subgraph Conductor["Vista Conductor"]
        VB[/vista-bus]
    end

    %% Rutas desde Login
    A -->|Admin| D
    A -->|Invitado| U

    %% Dashboard navigation
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    D --> D5
    D --> D6
    D --> D7
    D --> D8
    D --> DM

    %% Data Master submódulos
    DM --> DM1
    DM --> DM2
    DM --> DM3
    DM --> DM4
    DM --> DM5

    %% Usuario móvil navigation
    U --> U1
    U --> U2
    U --> U3
    U2 --> U2D

    %% Tracking redirect
    U1 -.tracking redirect.-> U

    %% Vista bus desde config
    D6 --> VB

    %% Preview de usuario en dashboard
    D8 -.embeds.-> U

    %% Estilos
    classDef loginClass fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef dashClass fill:#10b981,stroke:#059669,color:#fff
    classDef userClass fill:#f59e0b,stroke:#d97706,color:#fff
    classDef driverClass fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef dmClass fill:#06b6d4,stroke:#0891b2,color:#fff

    class A loginClass
    class D,D1,D2,D3,D4,D5,D6,D7,D8,DM dashClass
    class DM1,DM2,DM3,DM4,DM5 dmClass
    class U,U1,U2,U2D,U3 userClass
    class VB driverClass
```

---

## Resumen de Navegación

### Flujos Principales

1. **Flujo Administrativo:**
   ```
   Login → Dashboard → [Cualquier módulo] → Volver a Dashboard
   ```

2. **Flujo Usuario Móvil:**
   ```
   Login (invitado) → Usuario → Bottom Nav → [Inicio/Horarios/Historial/Perfil]
   ```

3. **Flujo Tracking:**
   ```
   /usuario/horarios → Tracking PGA → AlertDialog → Aceptar → /usuario?startTracking=true&busId=X → Auto-notificar
   ```

4. **Flujo Conductor:**
   ```
   Dashboard → Configuración → Vista Bus → Iniciar Ruta → Confirmar Paradas (TTS) → Finalizar
   ```

5. **Flujo Data Master:**
   ```
   Dashboard → Data Master → [Conductores/Rutas/Vehículos/Estatus/Especiales] → CRUD
   ```

---

## Notas Técnicas de Implementación

### Client vs Server Components

**Client Components (requieren "use client"):**
- `/dashboard/layout.tsx` - Usa hooks (useState, usePathname)
- `/usuario/*` - Todas las páginas (usan Context)
- `/vista-bus/*` - Usa useState, setInterval para reloj

**Server Components (sin "use client"):**
- `/dashboard/page.tsx` - Puede ser server si no usa hooks
- Páginas estáticas de Data Master

### Dynamic Imports

**Leaflet requiere:**
```tsx
const LeafletMap = dynamic(
  () => import('@/components/leaflet-map'),
  { ssr: false }
);
```

### Persistencia

**localStorage keys:**
- `isStopNotified` - Si usuario notificó parada
- `penaltyEndTime` - Timestamp de fin de penalización
- `selectedBusId` - Bus seleccionado actualmente

### Parámetros de URL

**Query params:**
- `/usuario?startTracking=true&busId=BUSCESAC-1` - Auto-notificación
- `/usuario/historial/[id]` - ID dinámico de viaje

---

## Recursos Relacionados

- **Arquitectura:** Ver [arquitectura.md](./arquitectura.md) para detalles técnicos
- **Entidades:** Ver [entidades.md](./entidades.md) para interfaces completas
- **Flujos:** Ver [flujos-de-proceso.md](./flujos-de-proceso.md) para diagramas de secuencia
- **Componentes:** Ver [componentes.md](./componentes.md) para catálogo UI

---

**© 2025 CESAC - Dirección de Tecnología y Comunicaciones**
**Desarrollado por:** Kendy Qualey

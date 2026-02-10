# Catálogo de Componentes

**Documentación del Sistema de Ubicación Vehicular CESAC**
**Versión 1.0** | **Última actualización:** Febrero 2025

---

## Índice

1. [Componentes UI de shadcn/ui](#componentes-ui-de-shadcnui)
2. [Componentes Personalizados](#componentes-personalizados)
3. [Providers y Contexto](#providers-y-contexto)
4. [Hooks Personalizados](#hooks-personalizados)
5. [Sistema de Estilización](#sistema-de-estilización)

---

## Componentes UI de shadcn/ui

**Ubicación:** [components/ui/](../src/components/ui/)

El sistema utiliza **35+ componentes** de [shadcn/ui](https://ui.shadcn.com), una colección de componentes accesibles y reutilizables construidos con Radix UI y Tailwind CSS.

### Tabla Completa de Componentes UI

| Componente | Archivo | Descripción | Uso Principal en CESAC |
|------------|---------|-------------|------------------------|
| **Accordion** | accordion.tsx | Listas expandibles con secciones colapsables | Horarios por ruta en `/usuario/horarios` |
| **Alert** | alert.tsx | Mensajes de alerta inline | Notificaciones de estado |
| **AlertDialog** | alert-dialog.tsx | Diálogos modales de confirmación | Alerta de proximidad (20s), confirmaciones |
| **Avatar** | avatar.tsx | Imágenes de perfil circulares | Perfil de usuario en header y `/perfil` |
| **Badge** | badge.tsx | Etiquetas de estado y categorías | Estados de bus, solicitudes, vehículos |
| **Button** | button.tsx | Botones del sistema | Todas las acciones: notificar, confirmar, enviar |
| **Calendar** | calendar.tsx | Selector de fechas | Formularios de Data Master |
| **Card** | card.tsx | Tarjetas contenedoras | Métricas, información, módulos |
| **Carousel** | carousel.tsx | Carrusel de elementos | No utilizado actualmente |
| **Chart** | chart.tsx | Wrapper para Recharts | Reportes y gráficos |
| **Checkbox** | checkbox.tsx | Casillas de verificación | Formularios de preferencias |
| **Collapsible** | collapsible.tsx | Secciones colapsables | Sidebar de navegación |
| **Dialog** | dialog.tsx | Modales genéricos | CRUD de entidades, formularios |
| **DropdownMenu** | dropdown-menu.tsx | Menús desplegables | Avatar de usuario, acciones en tablas |
| **Form** | form.tsx | Wrapper para React Hook Form | Todos los formularios del sistema |
| **Input** | input.tsx | Campos de texto | Formularios, búsquedas |
| **Label** | label.tsx | Etiquetas de campos | Formularios |
| **Menubar** | menubar.tsx | Barra de menú horizontal | No utilizado actualmente |
| **Popover** | popover.tsx | Popovers contextuales | Selectores de fecha, filtros |
| **Progress** | progress.tsx | Barras de progreso | Indicadores de carga |
| **RadioGroup** | radio-group.tsx | Grupos de opciones excluyentes | Formularios de selección única |
| **ScrollArea** | scroll-area.tsx | Áreas con scroll personalizado | Listas largas, sidebars |
| **Select** | select.tsx | Selectores dropdown | Selección de bus, rutas, estados |
| **Separator** | separator.tsx | Líneas separadoras | Divisiones de secciones |
| **Sheet** | sheet.tsx | Paneles laterales deslizables | No utilizado actualmente |
| **Sidebar** | sidebar.tsx | Navegación lateral completa | Dashboard layout |
| **Skeleton** | skeleton.tsx | Placeholders de carga | Estados de loading |
| **Slider** | slider.tsx | Controles deslizantes | Configuración de preferencias |
| **Switch** | switch.tsx | Interruptores on/off | Configuración, activar/desactivar rutas |
| **Table** | table.tsx | Tablas de datos | Usuarios, choferes, vehículos, historial |
| **Tabs** | tabs.tsx | Pestañas de navegación | Solicitudes por ruta, choferes/vehículos |
| **Textarea** | textarea.tsx | Campos de texto multilínea | Comentarios en encuestas, descripciones |
| **Toast / Toaster** | toast.tsx / toaster.tsx | Notificaciones temporales | Confirmaciones, errores, alertas |
| **Tooltip** | tooltip.tsx | Tooltips informativos | Ayuda contextual en botones |

---

### Componentes UI Detallados

#### Accordion

**Archivo:** [components/ui/accordion.tsx](../src/components/ui/accordion.tsx)

**Uso:**
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Ruta Charles de Gaulle</AccordionTrigger>
    <AccordionContent>
      {/* Contenido de horarios */}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Ruta Autopista Duarte</AccordionTrigger>
    <AccordionContent>
      {/* Contenido de horarios */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Variantes:**
- `type="single"` - Solo un item abierto a la vez
- `type="multiple"` - Múltiples items abiertos
- `collapsible` - Permite cerrar el item activo

---

#### AlertDialog

**Archivo:** [components/ui/alert-dialog.tsx](../src/components/ui/alert-dialog.tsx)

**Uso:**
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

<AlertDialog open={showAlert} onOpenChange={setShowAlert}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¡Bus a punto de llegar!</AlertDialogTitle>
      <AlertDialogDescription>
        El bus llegará a tu parada en aproximadamente 20 segundos.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction>Aceptar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Uso en CESAC:**
- Alerta de proximidad (20 segundos)
- Confirmación de cambio de parada (PGA)
- Confirmaciones de eliminación en CRUD

---

#### Badge

**Archivo:** [components/ui/badge.tsx](../src/components/ui/badge.tsx)

**Variantes:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">En ruta</Badge>
<Badge variant="secondary">Retrasado</Badge>
<Badge variant="destructive">Dañado</Badge>
<Badge variant="outline">Inactivo</Badge>
```

**Uso en CESAC:**
- Estados de bus: En ruta, Retrasado, Dañado
- Estados de solicitud: Confirmado, No recogido, Cancelado
- Estados de vehículo: Operativo, En Taller, Fuera de Servicio

---

#### Button

**Archivo:** [components/ui/button.tsx](../src/components/ui/button.tsx)

**Variantes:**
```tsx
import { Button } from '@/components/ui/button';

{/* Variantes */}
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

{/* Tamaños */}
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔔</Button>
```

**Uso en CESAC:**
- Botón principal: "Estoy en la parada"
- Botones de acción: Iniciar RUTA, Confirmar Parada
- Botones de navegación: Bottom Navigation
- Botones en tablas: Editar, Eliminar

---

#### Card

**Archivo:** [components/ui/card.tsx](../src/components/ui/card.tsx)

**Estructura:**
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título de la Card</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido principal */}
  </CardContent>
  <CardFooter>
    {/* Acciones o información adicional */}
  </CardFooter>
</Card>
```

**Uso en CESAC:**
- Métricas del dashboard (Buses Activos, Puntualidad)
- Módulos de Data Master
- Información de bus en Vista Usuario
- Cards de conductor en Vista Bus

---

#### Dialog

**Archivo:** [components/ui/dialog.tsx](../src/components/ui/dialog.tsx)

**Uso:**
```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Agregar Usuario</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Nuevo Usuario</DialogTitle>
      <DialogDescription>Completa el formulario para agregar un usuario.</DialogDescription>
    </DialogHeader>
    <form>
      {/* Campos del formulario */}
    </form>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Uso en CESAC:**
- CRUD de todas las entidades (Usuarios, Choferes, Vehículos, Rutas)
- Formularios de Data Master
- QR Code Dialog

---

#### Form (React Hook Form Integration)

**Archivo:** [components/ui/form.tsx](../src/components/ui/form.tsx)

**Uso con Zod:**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormDescription>Nombre completo del usuario</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

**Uso en CESAC:**
- Todos los formularios de CRUD
- Login
- Configuración de preferencias
- Data Master (Conductores, Rutas, Vehículos)

---

#### Select

**Archivo:** [components/ui/select.tsx](../src/components/ui/select.tsx)

**Uso:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={selectedBusId} onValueChange={setSelectedBusId}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Selecciona tu bus" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="BUSCESAC-1">BUSCESAC-1</SelectItem>
    <SelectItem value="BUSCESAC-2">BUSCESAC-2</SelectItem>
    <SelectItem value="BUSCESAC-3">BUSCESAC-3</SelectItem>
  </SelectContent>
</Select>
```

**Uso en CESAC:**
- Selección de bus en Vista Usuario
- Selección de ruta en formularios
- Asignación de vehículos
- Filtros en tablas

---

#### Sidebar

**Archivo:** [components/ui/sidebar.tsx](../src/components/ui/sidebar.tsx)

**Componentes del sistema de sidebar:**
- `SidebarProvider` - Wrapper raíz
- `Sidebar` - Contenedor principal
- `SidebarHeader` - Encabezado (logo)
- `SidebarContent` - Contenido del menú
- `SidebarFooter` - Pie (logout)
- `SidebarMenu` - Menú de navegación
- `SidebarMenuItem` - Item individual
- `SidebarMenuButton` - Botón de item
- `SidebarMenuSub` - Submenú
- `SidebarMenuSubItem` - Item de submenú
- `SidebarMenuSubButton` - Botón de subitem
- `SidebarTrigger` - Botón toggle (móvil)
- `SidebarInset` - Contenedor del contenido principal

**Uso:**
```tsx
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <Icons.logo />
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard">
              <Map className="h-4 w-4" />
              <span>Monitoreo</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    {/* Contenido principal */}
  </SidebarInset>
</SidebarProvider>
```

**Uso en CESAC:**
- Navegación principal del Dashboard
- Menú colapsable en móvil
- Items con tooltips
- Submenús para Gestión y Configuración

---

#### Table

**Archivo:** [components/ui/table.tsx](../src/components/ui/table.tsx)

**Estructura:**
```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableCaption>Lista de usuarios registrados</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.id}</TableCell>
        <TableCell>{user.nombre}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Editar</Button>
          <Button variant="ghost" size="sm">Eliminar</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Uso en CESAC:**
- Gestión de Usuarios
- Choferes y Vehículos
- Historial de viajes
- Solicitudes y Paradas
- Todas las tablas de Data Master

---

#### Tabs

**Archivo:** [components/ui/tabs.tsx](../src/components/ui/tabs.tsx)

**Uso:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="charles">
  <TabsList>
    <TabsTrigger value="charles">Charles de Gaulle</TabsTrigger>
    <TabsTrigger value="duarte">Autopista Duarte</TabsTrigger>
    <TabsTrigger value="independencia">Independencia</TabsTrigger>
  </TabsList>
  <TabsContent value="charles">
    {/* Solicitudes de ruta Charles */}
  </TabsContent>
  <TabsContent value="duarte">
    {/* Solicitudes de ruta Duarte */}
  </TabsContent>
  <TabsContent value="independencia">
    {/* Solicitudes de ruta Independencia */}
  </TabsContent>
</Tabs>
```

**Uso en CESAC:**
- Solicitudes por ruta
- Choferes vs Vehículos
- Navegación entre secciones

---

#### Toast

**Archivo:** [components/ui/toast.tsx](../src/components/ui/toast.tsx) + [components/ui/toaster.tsx](../src/components/ui/toaster.tsx)

**Uso:**
```tsx
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// En el componente
const { toast } = useToast();

// Llamadas
toast({
  title: "✅ Parada notificada",
  description: "El bus llegará en 1 minuto.",
});

toast({
  title: "⚠️ Error",
  description: "No se pudo procesar la solicitud.",
  variant: "destructive",
});

// En layout.tsx
<Toaster />
```

**Variantes:**
- `variant="default"` - Notificación normal
- `variant="destructive"` - Error o alerta

**Uso en CESAC:**
- Confirmación de notificación de parada
- Errores de validación
- Confirmaciones de acciones CRUD
- Penalización aplicada

---

## Componentes Personalizados

### AnimatedCard

**Archivo:** [components/animated-card.tsx](../src/components/animated-card.tsx)

**Descripción:** Tarjetas con efecto glow 3D y animación al hover.

**Props:**
```typescript
interface AnimatedCardProps {
  href: string;            // Ruta de navegación
  glowClassName: string;   // Clase Tailwind del color del glow
  children: React.ReactNode;
}
```

**Uso:**
```tsx
import { AnimatedCard } from '@/components/animated-card';

<AnimatedCard href="/dashboard/data-master/rutas" glowClassName="from-blue-500/20">
  <CardHeader>
    <Route className="h-8 w-8" />
    <CardTitle>Gestión de Rutas</CardTitle>
    <CardDescription>Administra rutas y paradas</CardDescription>
  </CardHeader>
</AnimatedCard>
```

**Uso en CESAC:**
- Módulos de Data Master (5 cards)
- Hub central con efecto visual atractivo

---

### AnimatedMap

**Archivo:** [components/animated-map.tsx](../src/components/animated-map.tsx)

**Descripción:** Mapa decorativo animado sin interacción, con pin de ubicación animado.

**Props:**
```typescript
interface AnimatedMapProps {
  className?: string;
}
```

**Uso:**
```tsx
import { AnimatedMap } from '@/components/animated-map';

<AnimatedMap className="h-48 rounded-lg" />
```

**Características:**
- Gradiente de fondo simulando mapa
- Pin de ubicación con animación de rebote
- SVG con paths animados (calles simuladas)

**Uso en CESAC:**
- Vista de Usuario (`/usuario`) como elemento decorativo

---

### Countdown

**Archivo:** [components/countdown.tsx](../src/components/countdown.tsx)

**Descripción:** Círculo de progreso con countdown en formato MM:SS.

**Props:**
```typescript
interface CountdownProps {
  seconds: number;          // Segundos totales
  onComplete?: () => void;  // Callback cuando llega a 0
}
```

**Uso:**
```tsx
import { Countdown } from '@/components/countdown';

<Countdown
  seconds={countdownSeconds}
  onComplete={handleCountdownEnd}
/>
```

**Implementación:**
```tsx
export function Countdown({ seconds, onComplete }: CountdownProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  useEffect(() => {
    if (seconds === 0 && onComplete) {
      onComplete();
    }
  }, [seconds, onComplete]);

  return (
    <div className="relative h-40 w-40">
      <svg className="h-40 w-40 transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 70}`}
          strokeDashoffset={`${2 * Math.PI * 70 * (1 - (seconds / initialSeconds))}`}
          className="text-primary transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">
          {minutes}:{remainingSeconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
```

**Uso en CESAC:**
- Countdown de notificación de parada
- Visualización de tiempo estimado de llegada

---

### DriverProfileCard

**Archivo:** [components/driver-profile-card.tsx](../src/components/driver-profile-card.tsx)

**Descripción:** Tarjeta expandible con información completa del conductor.

**Props:**
```typescript
interface DriverProfileCardProps {
  driver: {
    id: string;
    nombre: string;
    cedula: string;
    telefono: string;
    email?: string;
    licencia: string;
    foto?: string;
    turno: 'Matutino' | 'Vespertino' | 'Nocturno';
    vehiculoAsignado?: string;
    rutaActual?: string;
    estado: 'Activo' | 'Vacaciones' | 'Inactivo';
    fechaIngreso: string;
  };
}
```

**Uso:**
```tsx
import { DriverProfileCard } from '@/components/driver-profile-card';

<DriverProfileCard driver={conductor} />
```

**Características:**
- Collapsible (expandir/colapsar)
- Avatar con foto del conductor
- Badges de turno y estado
- Información de contacto
- Vehículo y ruta asignados

**Uso en CESAC:**
- `/dashboard/choferes-y-vehiculos` (tab Choferes)

---

### Icons

**Archivo:** [components/icons.tsx](../src/components/icons.tsx)

**Descripción:** Componente del logo del proyecto.

**Exportación:**
```typescript
export const Icons = {
  logo: (props: LucideProps) => <Bus {...props} />,
};
```

**Uso:**
```tsx
import { Icons } from '@/components/icons';

<Icons.logo className="size-8 text-primary" />
```

**Uso en CESAC:**
- Sidebar header
- Loading screens
- Favicon (via metadata)

---

### LeafletMap

**Archivo:** [components/leaflet-map.tsx](../src/components/leaflet-map.tsx)

**Descripción:** Mapa interactivo con Leaflet mostrando ubicaciones de buses en tiempo real.

**Características:**
- Marcadores de buses con ícono personalizado
- Popups con información de cada bus
- Tiles de OpenStreetMap
- Centrado en República Dominicana

**Carga dinámica (IMPORTANTE):**
```tsx
// NO importar directamente en componente de servidor
// SIEMPRE usar dynamic import:
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(
  () => import('@/components/leaflet-map').then(m => m.LeafletMap),
  { ssr: false }  // CRÍTICO: deshabilitar SSR
);

export default function DashboardPage() {
  return <LeafletMap />;
}
```

**Problema sin `ssr: false`:**
```
Error: window is not defined
```

**Uso en CESAC:**
- Panel de Control GPS (`/dashboard`)
- Monitoreo en tiempo real de flota

---

### LogoutDialog

**Archivo:** [components/logout-dialog.tsx](../src/components/logout-dialog.tsx)

**Descripción:** Diálogo de confirmación para cerrar sesión.

**Props:**
```typescript
interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Uso:**
```tsx
import { LogoutDialog } from '@/components/logout-dialog';

const [showLogoutDialog, setShowLogoutDialog] = useState(false);

<LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />

<Button onClick={() => setShowLogoutDialog(true)}>
  Cerrar Sesión
</Button>
```

**Uso en CESAC:**
- Sidebar footer
- Dropdown de usuario
- Confirmación antes de logout

---

### QrCodeDialog

**Archivo:** [components/qr-code-dialog.tsx](../src/components/qr-code-dialog.tsx)

**Descripción:** Modal con código QR para compartir URL de Vista de Usuario.

**Props:**
```typescript
interface QrCodeDialogProps {
  qrValue: string;           // URL a codificar
  trigger: React.ReactNode;  // Elemento que abre el dialog
}
```

**Uso:**
```tsx
import { QrCodeDialog } from '@/components/qr-code-dialog';

<QrCodeDialog
  qrValue="https://cesac.com/usuario"
  trigger={
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <Smartphone className="mr-2 h-4 w-4" />
      <span>Código Vista Usuario</span>
    </DropdownMenuItem>
  }
/>
```

**Librería:** `qrcode.react`

**Uso en CESAC:**
- Dropdown de usuario en Dashboard
- Compartir acceso rápido a Vista de Usuario

---

### ReportCharts

**Archivo:** [components/report-charts.tsx](../src/components/report-charts.tsx)

**Descripción:** Componente de gráficos para reportes usando Recharts.

**Props:**
```typescript
interface ReportChartsProps {
  type: 'bar' | 'line' | 'radial';
}
```

**Uso:**
```tsx
import { ReportCharts } from '@/components/report-charts';

{/* Gráfico de barras */}
<ReportCharts type="bar" />

{/* Gráfico de líneas */}
<ReportCharts type="line" />

{/* Gráfico radial */}
<ReportCharts type="radial" />
```

**Gráficos incluidos:**

1. **Bar Chart** - Frecuencia de uso por ruta
```tsx
<BarChart data={frequencyData}>
  <Bar dataKey="trips" fill="#3b82f6" />
</BarChart>
```

2. **Line Chart** - Tiempos promedio de recorrido
```tsx
<LineChart data={timeData}>
  <Line type="monotone" dataKey="time" stroke="#10b981" />
</LineChart>
```

3. **Radial Chart** - Puntualidad por ruta
```tsx
<RadialBarChart data={punctualityData}>
  <RadialBar dataKey="percentage" />
</RadialBarChart>
```

**Uso en CESAC:**
- `/dashboard/reportes`
- Panel de control GPS (frecuencia)

---

### SurveyDialog

**Archivo:** [components/survey-dialog.tsx](../src/components/survey-dialog.tsx)

**Descripción:** Encuesta de satisfacción post-viaje con calificación de estrellas.

**Props:**
```typescript
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Uso:**
```tsx
import { SurveyDialog } from '@/components/survey-dialog';

<SurveyDialog open={showSurvey} onOpenChange={setShowSurvey} />
```

**Campos:**
- Calificación de 1 a 5 estrellas (obligatorio)
- Comentarios (opcional)
- Botón de envío

**Trigger:** Cuando countdown de notificación llega a 0

**Uso en CESAC:**
- Vista de Usuario después de cada viaje notificado

---

### ThemeToggle

**Archivo:** [components/theme-toggle.tsx](../src/components/theme-toggle.tsx)

**Descripción:** Botón para cambiar entre modo claro y oscuro.

**Implementación:**
```tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

**Librería:** `next-themes`

**Uso en CESAC:**
- Header del Dashboard
- Disponible en todas las páginas

---

### WeatherWidget

**Archivo:** [components/weather-widget.tsx](../src/components/weather-widget.tsx)

**Descripción:** Widget del clima con animaciones.

**Estados:**
- ☀️ Soleado (28°C)
- 🌧️ Lluvioso (24°C)

**Uso:**
```tsx
import { WeatherWidget } from '@/components/weather-widget';

<WeatherWidget />
```

**Características:**
- Actualización automática cada 5 minutos (simulado)
- Animaciones CSS de nubes y lluvia
- Transiciones suaves

**Uso en CESAC:**
- Vista de Usuario (`/usuario`)
- Vista del Conductor (`/vista-bus`)

---

## Providers y Contexto

### Providers (Root)

**Archivo:** [components/providers.tsx](../src/components/providers.tsx)

**Descripción:** Wrapper de todos los providers del sistema.

**Implementación:**
```tsx
"use client";

import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

**Uso en layout raíz:**
```tsx
import { Providers } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

### ThemeProvider

**Archivo:** [components/theme-provider.tsx](../src/components/theme-provider.tsx)

**Descripción:** Provider de `next-themes` para modo oscuro/claro.

**Librería:** `next-themes`

**Temas disponibles:**
- `light` - Modo claro
- `dark` - Modo oscuro
- `system` - Automático según preferencia del SO

---

### UsuarioProvider

**Archivo:** [app/usuario/usuario-provider.tsx](../src/app/usuario/usuario-provider.tsx:48-171)

**Descripción:** Context API para gestión de estado de Vista de Usuario.

**Context Type:**
```typescript
interface UsuarioContextType {
  buses: Bus[];
  updateBusStatus: (busId: string, status: string) => void;
  selectedBusId: string;
  setSelectedBusId: (id: string) => void;
  notified: boolean;
  isPenaltyActive: boolean;
  penaltyEndTime: number | null;
  countdownSeconds: number;
  showArrivalAlert: boolean;
  setShowArrivalAlert: (show: boolean) => void;
  showSurvey: boolean;
  setShowSurvey: (show: boolean) => void;
  handleNotify: () => void;
  handleCancellation: () => void;
  handlePenaltyEnd: () => void;
  getRemainingPenaltyTime: () => number;
}
```

**Uso:**
```tsx
"use client";

import { useUsuario } from '@/app/usuario/usuario-provider';

export default function UsuarioPage() {
  const {
    buses,
    selectedBusId,
    setSelectedBusId,
    notified,
    handleNotify,
    countdownSeconds,
  } = useUsuario();

  return (
    <div>
      <Select value={selectedBusId} onValueChange={setSelectedBusId}>
        {buses.map(bus => (
          <SelectItem key={bus.id} value={bus.id}>{bus.id}</SelectItem>
        ))}
      </Select>

      {!notified ? (
        <Button onClick={handleNotify}>Estoy en la parada</Button>
      ) : (
        <Countdown seconds={countdownSeconds} />
      )}
    </div>
  );
}
```

**Estado gestionado:**
- Buses disponibles
- Bus seleccionado
- Estado de notificación
- Countdown activo
- Penalización
- Alertas y encuestas

**Persistencia:**
- `localStorage` para `isStopNotified` y `penaltyEndTime`

---

## Hooks Personalizados

### useToast

**Archivo:** [hooks/use-toast.ts](../src/hooks/use-toast.ts)

**Descripción:** Hook para mostrar notificaciones toast.

**Uso:**
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "✅ Éxito",
  description: "Operación completada correctamente.",
});

toast({
  title: "⚠️ Error",
  description: "No se pudo completar la operación.",
  variant: "destructive",
});

toast({
  title: "ℹ️ Información",
  description: "Cambios guardados automáticamente.",
  duration: 3000,  // ms
});
```

**Opciones:**
- `title` - Título del toast
- `description` - Mensaje descriptivo
- `variant` - `"default"` o `"destructive"`
- `duration` - Duración en ms (default: 5000)

---

### useMobile

**Archivo:** [hooks/use-mobile.tsx](../src/hooks/use-mobile.tsx)

**Descripción:** Hook para detectar si es dispositivo móvil.

**Implementación:**
```tsx
import { useEffect, useState } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

**Uso:**
```tsx
import { useMobile } from '@/hooks/use-mobile';

export function MyComponent() {
  const isMobile = useMobile();

  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

**Breakpoint:** `768px` (Tailwind `md` breakpoint)

---

## Sistema de Estilización

### Función cn (className utility)

**Archivo:** [lib/utils.ts](../src/lib/utils.ts)

**Descripción:** Utilidad para combinar clases de Tailwind con condicionales.

**Implementación:**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Librerías:**
- `clsx` - Combina clases condicionales
- `tailwind-merge` - Resuelve conflictos de Tailwind

**Uso:**
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-styles p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed",
  className  // Props externas
)} />
```

**Ejemplos:**
```tsx
// Clases condicionales
cn("p-4", isLarge && "p-8")
// → "p-8" (sobreescribe p-4)

// Arrays
cn(["flex", "items-center"], "gap-4")
// → "flex items-center gap-4"

// Objetos
cn({ "bg-red-500": hasError, "bg-green-500": !hasError })
// → "bg-red-500" o "bg-green-500"
```

---

### Variables CSS de Temas

**Archivo:** [app/globals.css](../src/app/globals.css)

**Variables disponibles:**

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    /* ... */
  }
}
```

**Uso en componentes:**
```tsx
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</div>
```

**Ventaja:** Se adaptan automáticamente al tema (light/dark)

---

### Tailwind Custom Classes

**Configuración:** [tailwind.config.ts](../tailwind.config.ts)

**Fuente personalizada:**
```typescript
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

// Uso en layout
<body className={poppins.className}>
```

**Colores personalizados:**
```typescript
colors: {
  sidebar: {
    primary: "hsl(var(--sidebar-primary))",
    background: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
  },
}
```

---

## Resumen de Componentes por Categoría

### Formularios y Entrada

| Componente | Uso |
|------------|-----|
| Input | Campos de texto |
| Textarea | Texto multilínea |
| Select | Selectores dropdown |
| Checkbox | Casillas de verificación |
| RadioGroup | Opciones excluyentes |
| Switch | Interruptores on/off |
| Slider | Controles deslizantes |
| Calendar | Selector de fechas |
| Form | Wrapper de formularios |

### Navegación

| Componente | Uso |
|------------|-----|
| Sidebar | Menú lateral principal |
| Tabs | Pestañas de navegación |
| DropdownMenu | Menús desplegables |
| Menubar | Barra de menú horizontal |

### Feedback

| Componente | Uso |
|------------|-----|
| Toast | Notificaciones temporales |
| Alert | Mensajes inline |
| AlertDialog | Confirmaciones modales |
| Progress | Barras de progreso |
| Skeleton | Placeholders de carga |

### Contenedores

| Componente | Uso |
|------------|-----|
| Card | Tarjetas de información |
| Dialog | Modales genéricos |
| Sheet | Paneles laterales |
| ScrollArea | Áreas con scroll |
| Accordion | Secciones colapsables |
| Collapsible | Contenido colapsable |

### Visualización de Datos

| Componente | Uso |
|------------|-----|
| Table | Tablas de datos |
| Chart | Gráficos (Recharts) |
| Badge | Etiquetas de estado |
| Avatar | Imágenes de perfil |

### Utilidades

| Componente | Uso |
|------------|-----|
| Button | Botones de acción |
| Separator | Líneas separadoras |
| Tooltip | Tooltips informativos |
| Popover | Popovers contextuales |
| Label | Etiquetas de campos |

---

## Recursos Relacionados

- **Arquitectura:** Ver [arquitectura.md](./arquitectura.md) para configuración de Tailwind y Next.js
- **Pantallas:** Ver [pantallas-y-navegacion.md](./pantallas-y-navegacion.md) para uso de componentes en páginas
- **Flujos:** Ver [flujos-de-proceso.md](./flujos-de-proceso.md) para interacciones complejas
- **Desarrollo:** Ver [guia-desarrollo.md](./guia-desarrollo.md) para convenciones de código

---

**© 2025 CESAC - Dirección de Tecnología y Comunicaciones**
**Desarrollado por:** Kendy Qualey

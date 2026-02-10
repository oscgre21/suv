# Guía de Desarrollo

**Documentación del Sistema de Ubicación Vehicular CESAC**
**Versión 1.0** | **Última actualización:** Febrero 2025

---

## Índice

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Convenciones de Código](#convenciones-de-código)
3. [Estructura de Componentes](#estructura-de-componentes)
4. [Estilos con Tailwind CSS](#estilos-con-tailwind-css)
5. [Formularios con React Hook Form + Zod](#formularios-con-react-hook-form--zod)
6. [Gestión de Estado](#gestión-de-estado)
7. [Trabajo con Firebase](#trabajo-con-firebase)
8. [Trabajo con Google Genkit (TTS)](#trabajo-con-google-genkit-tts)
9. [Sistema de Audio](#sistema-de-audio)
10. [Debugging](#debugging)
11. [Troubleshooting Común](#troubleshooting-común)
12. [Comandos Útiles](#comandos-útiles)
13. [Recursos y Referencias](#recursos-y-referencias)

---

## Configuración del Entorno

### Requisitos Previos

Antes de comenzar a desarrollar en el proyecto CESAC, asegúrate de tener instalado:

| Software | Versión Requerida | Comando de Verificación |
|----------|-------------------|-------------------------|
| **Node.js** | 20.11.0 o superior | `node --version` |
| **npm** | 10.x o superior | `npm --version` |
| **Git** | 2.x o superior | `git --version` |
| **Firebase CLI** | Última versión | `firebase --version` |
| **Genkit CLI** | Última versión (opcional) | `genkit --version` |

### Instalación de Herramientas

```bash
# Node.js (vía nvm recomendado)
nvm install 20.11.0
nvm use 20.11.0

# Firebase CLI
npm install -g firebase-tools

# Genkit CLI (opcional para desarrollo de IA)
npm install -g genkit-cli
```

---

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env

# Google AI API Key (para Text-to-Speech con Genkit)
GOOGLE_API_KEY=tu_api_key_aqui

# Firebase Configuration (opcional si usas emulators locales)
FIREBASE_PROJECT_ID=studio-5170547963-be9ad
```

#### Obtener Google AI API Key

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea un nuevo proyecto o selecciona uno existente
3. Genera una nueva API Key
4. Copia la key y pégala en `.env`

**IMPORTANTE:** Nunca commits el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

### Instalación del Proyecto

```bash
# 1. Clonar el repositorio
git clone [url-del-repositorio]
cd cesac

# 2. Instalar dependencias
npm install

# 3. Verificar que todo está instalado
npm run typecheck

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor se iniciará en: **http://localhost:9002**

---

### Estructura del Proyecto

```
cesac/
├── ai/                         # Google Genkit (IA/TTS)
│   ├── genkit.ts              # Configuración principal
│   └── flows/
│       └── tts-flow.ts        # Flujo de Text-to-Speech
├── docs/                       # Documentación (7 archivos)
│   ├── README.md
│   ├── arquitectura.md
│   ├── entidades.md
│   ├── pantallas-y-navegacion.md
│   ├── flujos-de-proceso.md
│   ├── componentes.md
│   └── guia-desarrollo.md
├── functions/                  # Firebase Cloud Functions
├── public/                     # Recursos estáticos
│   └── audio/                 # Archivos de sonido
│       ├── success.mp3
│       ├── error.mp3
│       └── alert.mp3
├── src/
│   ├── app/                   # Next.js App Router (26 páginas)
│   │   ├── api/
│   │   │   └── tts/           # API Route para TTS
│   │   ├── dashboard/         # Panel administrativo (15 páginas)
│   │   │   ├── choferes-y-vehiculos/
│   │   │   ├── configuracion/
│   │   │   ├── data-master/   # 5 submódulos
│   │   │   ├── perfil/
│   │   │   ├── reportes/
│   │   │   ├── rutas/
│   │   │   ├── solicitudes/
│   │   │   ├── usuario/       # Preview
│   │   │   ├── usuarios/
│   │   │   ├── layout.tsx     # Layout del dashboard
│   │   │   └── page.tsx       # Panel GPS
│   │   ├── usuario/           # Vista móvil (5 páginas)
│   │   │   ├── historial/
│   │   │   ├── horarios/
│   │   │   ├── perfil/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── usuario-provider.tsx
│   │   ├── vista-bus/         # Vista del conductor
│   │   │   └── page.tsx
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Login
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── ui/                # 35+ componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (32 más)
│   │   ├── animated-card.tsx  # Componentes personalizados
│   │   ├── animated-map.tsx
│   │   ├── countdown.tsx
│   │   ├── driver-profile-card.tsx
│   │   ├── icons.tsx
│   │   ├── leaflet-map.tsx
│   │   ├── logout-dialog.tsx
│   │   ├── providers.tsx
│   │   ├── qr-code-dialog.tsx
│   │   ├── report-charts.tsx
│   │   ├── survey-dialog.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── weather-widget.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── firebase/
│       │   └── config.ts      # Configuración Firebase
│       ├── audio.ts           # Sistema de sonidos
│       ├── data.ts            # Datos iniciales
│       └── utils.ts           # Utilidades (cn, etc.)
├── .env                       # Variables de entorno (NO commitear)
├── .gitignore
├── firebase.json              # Config de Firebase
├── next.config.ts             # Config de Next.js
├── package.json               # Dependencias
├── tailwind.config.ts         # Config de Tailwind
└── tsconfig.json              # Config de TypeScript
```

---

## Convenciones de Código

### TypeScript

#### Configuración Strict Mode

El proyecto utiliza TypeScript en modo estricto. Todas las configuraciones están en [tsconfig.json](../tsconfig.json).

**Reglas importantes:**
- `strict: true` - Modo estricto activado
- `noImplicitAny: true` - No permitir `any` implícito
- `strictNullChecks: true` - Verificar null/undefined

#### Tipos vs Interfaces

```typescript
// ✅ Usa INTERFACE para objetos que pueden extenderse
interface User {
  id: string;
  nombre: string;
  email: string;
}

interface Admin extends User {
  permisos: string[];
}

// ✅ Usa TYPE para uniones, intersecciones, aliases
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;

type UserWithStatus = User & { status: Status };

// ❌ EVITA any
const data: any = fetchData();  // MAL

// ✅ Usa tipos específicos
const data: User[] = fetchData();  // BIEN
```

#### Evitar `any`

```typescript
// ❌ MAL
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ BIEN
function processData(data: { value: number }[]) {
  return data.map(item => item.value);
}

// ✅ Alternativa con genéricos
function processData<T extends { value: number }>(data: T[]) {
  return data.map(item => item.value);
}

// ✅ Si realmente no conoces el tipo, usa unknown
function processData(data: unknown) {
  if (Array.isArray(data)) {
    // Aquí ya puedes trabajar con data
  }
}
```

---

### Path Aliases

El proyecto usa aliases para imports más limpios:

```typescript
// ✅ BIEN - Usa aliases
import { Button } from '@/components/ui/button';
import { ai } from '@/ai/genkit';
import { Bus } from '@/app/usuario/usuario-provider';

// ❌ MAL - Evita paths relativos largos
import { Button } from '../../../components/ui/button';
```

**Configuración en tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/ai/*": ["./ai/*"]
    }
  }
}
```

---

### Nombrado de Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Páginas** | `page.tsx` | `app/dashboard/page.tsx` |
| **Layouts** | `layout.tsx` | `app/dashboard/layout.tsx` |
| **Loading** | `loading.tsx` | `app/dashboard/loading.tsx` |
| **Error** | `error.tsx` | `app/dashboard/error.tsx` |
| **Componentes** | kebab-case | `animated-card.tsx` |
| **Componentes UI** | kebab-case | `alert-dialog.tsx` |
| **Hooks** | kebab-case con `use-` | `use-mobile.tsx` |
| **Utilidades** | kebab-case | `audio.ts`, `utils.ts` |
| **Tipos** | PascalCase | `User`, `Bus`, `Route` |

---

### Formato de Código

**Indentación:** 2 espacios (configurado en EditorConfig)

**Comillas:** Simples `'` para strings en TypeScript/JavaScript

**Punto y coma:** Opcional, pero consistente (el proyecto usa punto y coma)

**Ejemplo:**
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

---

## Estructura de Componentes

### Server Components vs Client Components

Next.js 15 usa **Server Components por defecto**. Solo usa `"use client"` cuando necesites:

#### Cuándo usar `"use client"`

| Característica | Server Component | Client Component |
|----------------|------------------|------------------|
| **React Hooks** (useState, useEffect) | ❌ No | ✅ Sí |
| **Event Handlers** (onClick, onChange) | ❌ No | ✅ Sí |
| **Browser APIs** (window, localStorage) | ❌ No | ✅ Sí |
| **Context Providers** | ❌ No | ✅ Sí |
| **Fetch directo** | ✅ Sí | ❌ No (usa useEffect) |
| **Variables de entorno** (server-side) | ✅ Sí | ❌ No |

#### Server Component (por defecto)

```typescript
// ✅ Server Component (sin "use client")
// app/dashboard/page.tsx

import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  // Puede hacer fetch directo aquí
  const data = await fetchData();

  return (
    <Card>
      <h1>Dashboard</h1>
      {/* Renderizado en servidor */}
    </Card>
  );
}
```

#### Client Component

```typescript
// ✅ Client Component (con "use client")
// components/counter.tsx

"use client";  // OBLIGATORIO al inicio del archivo

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

#### Composición de Server y Client Components

```typescript
// ✅ BIEN - Server Component que usa Client Component
// app/dashboard/page.tsx

import { ClientCounter } from '@/components/client-counter';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <Card>
      <h1>Dashboard</h1>
      {/* Este componente es server-side */}

      <ClientCounter />
      {/* Este componente es client-side */}
    </Card>
  );
}
```

---

### Dynamic Imports (para Leaflet y librerías de navegador)

Leaflet (mapas) requiere `window`, que no existe en el servidor.

**IMPORTANTE:** Siempre usa dynamic import con `ssr: false`.

```typescript
// ✅ BIEN
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LeafletMap = dynamic(
  () => import('@/components/leaflet-map').then(m => m.LeafletMap),
  {
    ssr: false,  // CRÍTICO: deshabilitar SSR
    loading: () => <Skeleton className="h-[400px] w-full" />
  }
);

export default function MapPage() {
  return (
    <div>
      <h1>Mapa</h1>
      <LeafletMap />
    </div>
  );
}
```

```typescript
// ❌ MAL - Esto causará error "window is not defined"
import { LeafletMap } from '@/components/leaflet-map';
```

---

### Patrón de Componente Típico

```typescript
"use client";  // Si necesita interactividad

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  initialCount?: number;
  className?: string;
}

export function MyComponent({ title, initialCount = 0, className }: MyComponentProps) {
  const [count, setCount] = useState(initialCount);
  const { toast } = useToast();

  const handleClick = () => {
    setCount(count + 1);
    toast({
      title: "✅ Incrementado",
      description: `Nuevo valor: ${count + 1}`,
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{count}</p>
        <Button onClick={handleClick}>Incrementar</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Estilos con Tailwind CSS

### Uso de Utility Classes

Tailwind CSS es un framework utility-first. En lugar de escribir CSS personalizado, combinas clases pequeñas.

```tsx
// ✅ Uso de Tailwind
<div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-6 shadow-sm">
  <h2 className="text-2xl font-bold">Título</h2>
  <Button variant="default" size="lg">
    Acción
  </Button>
</div>
```

### Clases Condicionales con `cn()`

Usa la utilidad `cn()` para combinar clases con condicionales:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-styles p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed",
  size === 'large' && "p-8 text-xl",
  className  // Props externas
)} />
```

**Ejemplos prácticos:**

```tsx
// Botón con estado
<Button
  className={cn(
    "w-full",
    isPending && "opacity-50 cursor-wait"
  )}
  disabled={isPending}
>
  {isPending ? "Cargando..." : "Enviar"}
</Button>

// Badge con color dinámico
<Badge
  className={cn(
    status === 'active' && "bg-green-500",
    status === 'inactive' && "bg-gray-500",
    status === 'error' && "bg-red-500"
  )}
>
  {status}
</Badge>
```

---

### Variables de Tema (Light/Dark)

Usa **variables CSS** en lugar de colores hardcoded para soporte de temas.

```tsx
// ✅ BIEN - Usa variables CSS
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</div>

// ❌ MAL - Colores hardcoded
<div className="bg-white text-black border-gray-300">
  <Button className="bg-blue-500 text-white">
    Click me
  </Button>
</div>
```

**Variables disponibles:**

| Variable | Descripción | Ejemplo de Uso |
|----------|-------------|----------------|
| `background` | Fondo principal | `bg-background` |
| `foreground` | Texto principal | `text-foreground` |
| `primary` | Color primario | `bg-primary` |
| `primary-foreground` | Texto sobre primario | `text-primary-foreground` |
| `secondary` | Color secundario | `bg-secondary` |
| `muted` | Texto/fondo atenuado | `text-muted-foreground` |
| `accent` | Color de acento | `bg-accent` |
| `destructive` | Color de error/eliminar | `bg-destructive` |
| `border` | Bordes | `border-border` |
| `card` | Fondo de tarjetas | `bg-card` |

---

### Breakpoints Responsivos

```tsx
<div className="
  p-4           /* Móvil */
  sm:p-6        /* ≥640px */
  md:p-8        /* ≥768px */
  lg:p-12       /* ≥1024px */
  xl:p-16       /* ≥1280px */
">
  <h1 className="
    text-2xl    /* Móvil */
    md:text-4xl /* ≥768px */
    lg:text-6xl /* ≥1024px */
  ">
    Título Responsivo
  </h1>
</div>
```

**Breakpoints de Tailwind:**
- `sm`: 640px
- `md`: 768px (usado por `useMobile` hook)
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

### Dark Mode

El tema oscuro se aplica automáticamente con `class="dark"` en el `<html>`:

```tsx
// Automático con ThemeProvider
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Contenido adaptable
</div>
```

**Cambiar tema:**
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  Toggle Theme
</Button>
```

---

## Formularios con React Hook Form + Zod

### Definir Schema con Zod

```typescript
import { z } from 'zod';

const userSchema = z.object({
  nombre: z.string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres"),

  email: z.string()
    .email("Email inválido"),

  cedula: z.string()
    .regex(/^\d{11}$/, "La cédula debe tener 11 dígitos"),

  edad: z.number()
    .int("Debe ser un número entero")
    .min(18, "Debe ser mayor de edad")
    .max(100, "Edad inválida"),

  rutaAsignada: z.string()
    .min(1, "Debes seleccionar una ruta"),

  telefono: z.string()
    .optional(),  // Campo opcional
});

type UserFormData = z.infer<typeof userSchema>;
```

---

### Crear Formulario

```tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  rutaAsignada: z.string().min(1, "Selecciona una ruta"),
});

type FormData = z.infer<typeof formSchema>;

export function UserForm() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      rutaAsignada: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast({
      title: "✅ Usuario creado",
      description: `${data.nombre} ha sido registrado correctamente.`,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo de texto */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormDescription>Nombre legal del usuario</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
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

        {/* Select */}
        <FormField
          control={form.control}
          name="rutaAsignada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruta Asignada</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ruta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="RUTA-01">Charles de Gaulle</SelectItem>
                  <SelectItem value="RUTA-02">Autopista Duarte</SelectItem>
                  <SelectItem value="RUTA-03">Independencia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Usuario"}
        </Button>
      </form>
    </Form>
  );
}
```

---

### Validaciones Comunes

```typescript
// String con longitud
z.string().min(2).max(100)

// Email
z.string().email()

// Número entero
z.number().int()

// Número con rango
z.number().min(0).max(100)

// Regex (cédula dominicana)
z.string().regex(/^\d{11}$/, "Formato inválido")

// Enum
z.enum(['Matutino', 'Vespertino', 'Nocturno'])

// Opcional
z.string().optional()

// Con valor por defecto
z.string().default("valor_default")

// Array
z.array(z.string())

// Objeto anidado
z.object({
  direccion: z.object({
    calle: z.string(),
    ciudad: z.string(),
  })
})

// Unión de tipos
z.union([z.string(), z.number()])

// Refine personalizado
z.string().refine(val => val.length >= 8, {
  message: "Debe tener al menos 8 caracteres"
})
```

---

## Gestión de Estado

### useState (Estado Local)

Para estado local del componente:

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Incrementar</Button>
      <Button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );
}
```

---

### Context API (Estado Global)

El proyecto usa `UsuarioProvider` para estado global de la vista de usuario:

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
    isPenaltyActive,
  } = useUsuario();

  return (
    <div>
      <Select value={selectedBusId} onValueChange={setSelectedBusId}>
        {buses.map(bus => (
          <SelectItem key={bus.id} value={bus.id}>{bus.id}</SelectItem>
        ))}
      </Select>

      {isPenaltyActive ? (
        <Button disabled>Penalizado</Button>
      ) : notified ? (
        <Countdown seconds={countdownSeconds} />
      ) : (
        <Button onClick={handleNotify}>Estoy en la parada</Button>
      )}
    </div>
  );
}
```

---

### localStorage (Persistencia)

Para datos que deben persistir entre sesiones:

```typescript
// Guardar
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify(userData));

// Leer
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Remover
localStorage.removeItem('key');

// Limpiar todo
localStorage.clear();
```

**IMPORTANTE:** Solo funciona en el cliente. Verifica que `window` existe:

```typescript
// ✅ BIEN
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}

// ✅ Alternativa con useEffect
useEffect(() => {
  localStorage.setItem('key', 'value');
}, []);
```

**Keys usadas en CESAC:**
- `isStopNotified` - Boolean de parada notificada
- `penaltyEndTime` - Timestamp de fin de penalización

---

## Trabajo con Firebase

### Configuración

**Archivo:** [lib/firebase/config.ts](../src/lib/firebase/config.ts)

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-5170547963-be9ad",
  appId: "1:486787755882:web:422762397b8e4ab390ff13",
  apiKey: "AIzaSyDFzBFfkZKJe9B5eUexooStY3OUQkOoxFY",
  authDomain: "studio-5170547963-be9ad.firebaseapp.com",
  storageBucket: "studio-5170547963-be9ad.appspot.com",
  messagingSenderId: "486787755882",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

### Deploy a Firebase

```bash
# 1. Login a Firebase
firebase login

# 2. Seleccionar proyecto
firebase use studio-5170547963-be9ad

# 3. Build del proyecto
npm run build

# 4. Deploy completo
firebase deploy

# 5. Deploy solo hosting
firebase deploy --only hosting

# 6. Deploy solo functions
firebase deploy --only functions
```

---

### Emuladores Locales (Opcional)

```bash
# Iniciar emuladores
firebase emulators:start

# Emuladores disponibles:
# - Firestore: http://localhost:8080
# - Auth: http://localhost:9099
# - Functions: http://localhost:5001
```

---

## Trabajo con Google Genkit (TTS)

### Configuración

**Archivo:** [ai/genkit.ts](../ai/genkit.ts)

```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
});
```

---

### Desarrollo con Genkit

```bash
# Terminal 1: Genkit UI (desarrollo)
npm run genkit:dev
# Abre: http://localhost:4000

# Terminal 2: Genkit con hot-reload
npm run genkit:watch

# Terminal 3: Next.js dev server
npm run dev
```

**Genkit Developer UI** permite probar flows sin Next.js:

1. Ve a http://localhost:4000
2. Selecciona el flow `generateSpeechFlow`
3. Ingresa texto: "Próxima parada: Cruce Sabana Larga"
4. Run → Escucha el audio generado

---

### Crear Nuevo Flow

```typescript
// ai/flows/mi-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const miFlow = ai.defineFlow(
  {
    name: 'miFlow',
    inputSchema: z.object({
      texto: z.string(),
    }),
    outputSchema: z.object({
      resultado: z.string(),
    }),
  },
  async (input) => {
    // Lógica del flow
    const procesado = input.texto.toUpperCase();

    return {
      resultado: procesado,
    };
  }
);

// Exportar función para usar desde Next.js
export async function ejecutarFlow(texto: string) {
  return await miFlow({ texto });
}
```

---

### Usar TTS desde Cliente

```tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateSpeech } from '@/ai/flows/tts-flow';

export function TTSDemo() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSpeak = async () => {
    setIsGenerating(true);
    try {
      const audio = await generateSpeech("Hola, bienvenido al sistema CESAC");
      const audioElement = new Audio(audio.media);
      await audioElement.play();
    } catch (error) {
      console.error('Error generando TTS:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleSpeak} disabled={isGenerating}>
      {isGenerating ? "Generando..." : "Hablar"}
    </Button>
  );
}
```

---

## Sistema de Audio

**Archivo:** [lib/audio.ts](../src/lib/audio.ts)

```typescript
import { playSuccessSound, playErrorSound, playLoopingAlertSound, stopLoopingAlertSound } from '@/lib/audio';

// Sonido de éxito (notificación confirmada)
playSuccessSound();

// Sonido de error (cancelación, penalización)
playErrorSound();

// Sonido en loop (alerta de proximidad)
playLoopingAlertSound();

// Detener sonido en loop
stopLoopingAlertSound();
```

**Archivos de audio:** Deben estar en `/public/audio/`

- `success.mp3` - Confirmación exitosa
- `error.mp3` - Error o cancelación
- `alert.mp3` - Alerta de proximidad (loop)

---

## Debugging

### Console Logs

```typescript
console.log('Debug info:', data);
console.error('Error occurred:', error);
console.warn('Warning:', warning);
console.table(arrayOfObjects);  // Tabla en consola
```

---

### React DevTools

Instala la extensión de Chrome/Firefox:
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

**Funcionalidades:**
- Inspeccionar árbol de componentes
- Ver props y state en tiempo real
- Profiler para performance

---

### Next.js DevTools

Next.js 15 incluye DevTools integradas:
- Abre el panel de DevTools del navegador
- Tab "Next.js"
- Ver rutas, compilación, caché

---

### TypeScript Errors

```bash
# Verificar errores de tipos
npm run typecheck

# Output detallado
npx tsc --noEmit --pretty
```

---

## Troubleshooting Común

### 1. `window is not defined`

**Causa:** Intentando usar APIs del navegador en Server Component

**Solución:**
```tsx
// ✅ Usa dynamic import
const Component = dynamic(() => import('./component'), { ssr: false });

// ✅ O verifica window
if (typeof window !== 'undefined') {
  // código que usa window
}

// ✅ O usa useEffect
useEffect(() => {
  // código que usa window
}, []);
```

---

### 2. Leaflet no funciona

**Error:** `window is not defined` o `document is not defined`

**Solución:**
```tsx
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(
  () => import('@/components/leaflet-map'),
  { ssr: false }  // OBLIGATORIO
);
```

---

### 3. Firebase deploy falla

**Error:** `Error: HTTP Error: 403, The caller does not have permission`

**Solución:**
```bash
# Logout y login de nuevo
firebase logout
firebase login

# Verificar proyecto correcto
firebase use --list
firebase use studio-5170547963-be9ad
```

---

### 4. Audio no se reproduce

**Causa:** Los navegadores bloquean autoplay sin interacción del usuario

**Solución:**
```tsx
// ❌ MAL - Puede ser bloqueado
useEffect(() => {
  playSuccessSound();
}, []);

// ✅ BIEN - Requiere interacción
<Button onClick={playSuccessSound}>
  Reproducir
</Button>
```

---

### 5. Tipos de TypeScript no encontrados

**Error:** `Cannot find module '@/components/ui/button'`

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Restart VS Code TypeScript server
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

### 6. Tailwind classes no funcionan

**Causa:** Purge/content mal configurado en `tailwind.config.ts`

**Solución:**
```typescript
// tailwind.config.ts
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Asegúrate de incluir todos los paths
  ],
}
```

---

### 7. Genkit TTS falla

**Error:** `Error: API key not configured`

**Solución:**
```bash
# Verificar .env
cat .env

# Debe contener:
GOOGLE_API_KEY=tu_api_key_aqui

# Restart del servidor
npm run dev
```

---

## Comandos Útiles

### Desarrollo

```bash
# Servidor de desarrollo (puerto 9002)
npm run dev

# Genkit UI (puerto 4000)
npm run genkit:dev

# Genkit con hot-reload
npm run genkit:watch
```

---

### Build y Verificación

```bash
# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar tipos TypeScript
npm run typecheck

# Linting
npm run lint
```

---

### Firebase

```bash
# Login
firebase login

# Listar proyectos
firebase projects:list

# Seleccionar proyecto
firebase use studio-5170547963-be9ad

# Emuladores locales
firebase emulators:start

# Deploy completo
firebase deploy

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo functions
firebase deploy --only functions
```

---

### Instalación de Paquetes

```bash
# Agregar dependencia
npm install [paquete]

# Agregar dev dependency
npm install -D [paquete]

# Desinstalar
npm uninstall [paquete]

# Actualizar todas las dependencias
npm update

# Verificar dependencias desactualizadas
npm outdated
```

---

### Git

```bash
# Ver cambios
git status

# Agregar archivos
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin main

# Pull cambios
git pull origin main

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main
```

---

## Recursos y Referencias

### Documentación Oficial

| Tecnología | URL |
|------------|-----|
| **Next.js 15** | https://nextjs.org/docs |
| **React 18** | https://react.dev |
| **TypeScript** | https://www.typescriptlang.org/docs |
| **Tailwind CSS** | https://tailwindcss.com/docs |
| **shadcn/ui** | https://ui.shadcn.com |
| **Firebase** | https://firebase.google.com/docs |
| **Google Genkit** | https://firebase.google.com/docs/genkit |
| **Leaflet** | https://leafletjs.com/reference.html |
| **React Hook Form** | https://react-hook-form.com |
| **Zod** | https://zod.dev |
| **Recharts** | https://recharts.org |
| **Framer Motion** | https://www.framer.com/motion |
| **Lucide Icons** | https://lucide.dev |

---

### Herramientas de Desarrollo

| Herramienta | Descripción |
|-------------|-------------|
| **VS Code** | Editor recomendado |
| **React DevTools** | Extensión para debugging |
| **Firebase Emulator Suite** | Testing local |
| **Genkit Developer UI** | UI de desarrollo de IA (http://localhost:4000) |

---

### Extensiones de VS Code Recomendadas

- **ESLint** - Linting de JavaScript/TypeScript
- **Tailwind CSS IntelliSense** - Autocompletado de Tailwind
- **Prettier** - Formateo de código
- **Error Lens** - Errores inline
- **GitLens** - Git mejorado
- **TypeScript Importer** - Auto-import de tipos

---

### Documentación Interna

| Documento | Descripción |
|-----------|-------------|
| [README.md](./README.md) | Punto de entrada principal |
| [arquitectura.md](./arquitectura.md) | Stack técnico y estructura |
| [entidades.md](./entidades.md) | Todas las entidades y DTOs |
| [pantallas-y-navegacion.md](./pantallas-y-navegacion.md) | Mapa de pantallas y navegación |
| [flujos-de-proceso.md](./flujos-de-proceso.md) | Flujos complejos con diagramas |
| [componentes.md](./componentes.md) | Catálogo de componentes |
| [guia-desarrollo.md](./guia-desarrollo.md) | Esta guía |

---

### Comunidad y Soporte

- **Stack Overflow** - Tags: `nextjs`, `react`, `firebase`, `tailwindcss`
- **GitHub Issues** - Reportar bugs del proyecto
- **Discord de Next.js** - https://discord.gg/nextjs
- **Firebase Community** - https://firebase.google.com/community

---

## Buenas Prácticas

### 1. Componentes Reutilizables

```tsx
// ✅ BIEN - Componente genérico y reutilizable
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variants = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
  };

  return (
    <Badge className={variants[status]}>
      {label || status}
    </Badge>
  );
}

// ❌ MAL - Hardcoded y no reutilizable
export function ActiveBadge() {
  return <Badge className="bg-green-500">Active</Badge>;
}
```

---

### 2. Evita Repetición de Código (DRY)

```tsx
// ✅ BIEN - Función reutilizable
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
};

<p>{formatCurrency(1000)}</p>
<p>{formatCurrency(2500)}</p>

// ❌ MAL - Código duplicado
<p>{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(1000)}</p>
<p>{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(2500)}</p>
```

---

### 3. Manejo de Errores

```tsx
// ✅ BIEN - Try-catch con feedback al usuario
const handleSubmit = async (data: FormData) => {
  try {
    await saveUser(data);
    toast({
      title: "✅ Éxito",
      description: "Usuario guardado correctamente.",
    });
  } catch (error) {
    console.error('Error guardando usuario:', error);
    toast({
      title: "⚠️ Error",
      description: "No se pudo guardar el usuario. Intenta de nuevo.",
      variant: "destructive",
    });
  }
};

// ❌ MAL - Sin manejo de errores
const handleSubmit = async (data: FormData) => {
  await saveUser(data);  // Puede fallar sin notificar al usuario
};
```

---

### 4. Loading States

```tsx
// ✅ BIEN - Estados de carga claros
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
};

<Button disabled={isLoading}>
  {isLoading ? "Cargando..." : "Enviar"}
</Button>

// ❌ MAL - Sin feedback de carga
const handleAction = async () => {
  await doSomething();
};

<Button>Enviar</Button>
```

---

### 5. Accesibilidad

```tsx
// ✅ BIEN - Accesible
<Button aria-label="Cerrar sesión" onClick={handleLogout}>
  <LogOut className="h-4 w-4" />
  <span className="sr-only">Cerrar sesión</span>
</Button>

<img src="/logo.png" alt="Logo de CESAC" />

// ❌ MAL - No accesible
<Button onClick={handleLogout}>
  <LogOut />
</Button>

<img src="/logo.png" />
```

---

## Checklist de Pre-Deploy

Antes de hacer deploy a producción:

- [ ] `npm run typecheck` - Sin errores de TypeScript
- [ ] `npm run lint` - Sin warnings de ESLint
- [ ] `npm run build` - Build exitoso
- [ ] Probar en modo producción local: `npm start`
- [ ] Verificar variables de entorno en `.env`
- [ ] Probar todas las rutas principales
- [ ] Probar en móvil (responsive)
- [ ] Probar modo oscuro
- [ ] Verificar que no hay `console.log` innecesarios
- [ ] Actualizar documentación si agregaste features

---

**© 2025 CESAC - Dirección de Tecnología y Comunicaciones**
**Desarrollado por:** Kendy Qualey
**Versión:** 1.0

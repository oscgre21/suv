# Arquitectura del Sistema CESAC

**Última actualización:** Febrero 2025

---

## Tabla de Contenidos

- [Introducción](#introducción)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Configuración Técnica](#configuración-técnica)
- [Patrones de Diseño](#patrones-de-diseño)
- [Arquitectura de Componentes](#arquitectura-de-componentes)
- [Sistema de Routing](#sistema-de-routing)
- [Sistema de Audio](#sistema-de-audio)
- [Integración con Firebase](#integración-con-firebase)
- [Integración con Google Genkit](#integración-con-google-genkit)
- [Diagramas de Arquitectura](#diagramas-de-arquitectura)

---

## Introducción

CESAC es una aplicación full-stack construida con tecnologías modernas que sigue los principios de:

- **Server-First:** Usa React Server Components por defecto
- **Type Safety:** TypeScript en modo estricto en todo el proyecto
- **Component Composition:** Componentes modulares y reutilizables
- **Progressive Enhancement:** Funciona incluso sin JavaScript
- **Performance First:** Optimizaciones con Turbopack y SSR
- **Responsive Design:** Adaptable a desktop, tablet y móvil

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15.3.3 | Framework React con App Router, SSR, y Server Actions |
| **React** | 18.3.1 | Biblioteca para interfaces de usuario |
| **TypeScript** | 5.x | Tipado estático y seguridad de tipos |

### UI y Estilos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first |
| **shadcn/ui** | - | Colección de 35+ componentes UI accesibles |
| **@radix-ui/*** | 1.x-2.x | Primitivas de UI sin estilos (base de shadcn/ui) |
| **Framer Motion** | 11.3.19 | Animaciones y transiciones fluidas |
| **lucide-react** | 0.475.0 | Iconos SVG optimizados |
| **next-themes** | 0.3.0 | Gestión de temas claro/oscuro |
| **tailwindcss-animate** | 1.0.7 | Animaciones CSS para Tailwind |

### Mapas y Geolocalización

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Leaflet** | 1.9.4 | Mapas interactivos open-source |
| **@types/leaflet** | 1.9.12 | Tipos TypeScript para Leaflet |

### Formularios y Validación

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React Hook Form** | 7.54.2 | Gestión performante de formularios |
| **Zod** | 3.24.2 | Validación de esquemas TypeScript-first |
| **@hookform/resolvers** | 4.1.3 | Integración Zod con React Hook Form |

### Backend y Hosting

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Firebase** | 11.9.1 | Plataforma backend (Hosting, Functions, Firestore) |
| **Firebase Admin** | 13.6.0 | SDK de administración del servidor |
| **Firebase Functions** | 7.0.1 | Cloud Functions serverless |
| **Firebase Frameworks** | 0.11.8 | Integración Next.js con Firebase |

### Inteligencia Artificial

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Google Genkit** | 1.13.0 | Framework de IA para aplicaciones |
| **@genkit-ai/googleai** | 1.13.0 | Plugin de Google AI para Genkit |
| **@genkit-ai/next** | 1.13.0 | Integración Next.js con Genkit |
| **Gemini 2.5 Flash TTS** | - | Modelo de Text-to-Speech |

### Gráficos y Visualizaciones

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Recharts** | 2.15.1 | Librería de gráficos basada en D3 |

### Audio

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **wav** | 1.0.2 | Conversión de audio PCM a WAV |

### Utilidades

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **date-fns** | 3.6.0 | Manipulación de fechas |
| **qrcode.react** | 3.1.0 | Generación de códigos QR |
| **class-variance-authority** | 0.7.1 | Variantes de clases CSS |
| **clsx** | 2.1.1 | Utilidad para clases condicionales |
| **tailwind-merge** | 3.0.1 | Merge inteligente de clases Tailwind |
| **embla-carousel-react** | 8.6.0 | Carrusel de imágenes |

### Desarrollo

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **genkit-cli** | 1.13.0 | CLI para desarrollo de flujos Genkit |
| **PostCSS** | 8.x | Procesamiento de CSS |
| **Turbopack** | - | Bundler ultra-rápido de Next.js |

---

## Estructura de Carpetas

### Estructura Completa

```
/Users/oscgre/Downloads/cesac/
├── .firebase/              # Configuración local de Firebase
├── .idx/                   # Configuración de Project IDX
├── .next/                  # Build output de Next.js (generado)
│
├── ai/                     # Google Genkit AI
│   ├── genkit.ts          # Configuración principal de Genkit
│   ├── dev.ts             # Servidor de desarrollo
│   └── flows/
│       └── tts-flow.ts    # Flujo de Text-to-Speech
│
├── docs/                   # Documentación del proyecto
│   ├── README.md          # Índice de documentación
│   ├── arquitectura.md    # Este archivo
│   ├── blueprint.md       # Diseño original
│   ├── componentes.md     # Catálogo de componentes
│   ├── entidades.md       # Documentación de entidades
│   ├── flujos-de-proceso.md
│   ├── guia-desarrollo.md
│   └── pantallas-y-navegacion.md
│
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts       # Next.js como Cloud Function
│   ├── lib/               # Código compilado
│   ├── package.json
│   └── tsconfig.json
│
├── public/                 # Archivos estáticos públicos
│   ├── audio/             # Archivos de sonido
│   └── ...
│
├── src/                    # Código fuente principal
│   ├── app/               # Next.js App Router
│   │   │
│   │   ├── api/           # API Routes
│   │   │   └── tts/
│   │   │       └── route.ts    # Endpoint Text-to-Speech
│   │   │
│   │   ├── dashboard/     # Panel administrativo (15 páginas)
│   │   │   ├── choferes-y-vehiculos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── configuracion/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── data-master/          # Hub de Data Master
│   │   │   │   ├── page.tsx          # Página principal
│   │   │   │   ├── conductores/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── estatus-vehiculo/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── rutas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── rutas-especiales/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── vehiculos/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── rutas/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── solicitudes/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── usuario/       # Preview de vista móvil
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx     # Layout del dashboard
│   │   │   └── page.tsx       # Panel de control GPS
│   │   │
│   │   ├── usuario/           # Vista móvil de usuario (5 páginas)
│   │   │   ├── historial/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx   # Detalle de viaje
│   │   │   │   └── page.tsx       # Lista de viajes
│   │   │   │
│   │   │   ├── horarios/
│   │   │   │   └── page.tsx       # Horarios con tracking
│   │   │   │
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── layout.tsx         # Layout de usuario
│   │   │   ├── page.tsx           # Inicio usuario
│   │   │   └── usuario-provider.tsx   # Context API
│   │   │
│   │   ├── vista-bus/         # Vista del conductor
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx         # Layout raíz de la aplicación
│   │   ├── page.tsx           # Página de login
│   │   ├── globals.css        # Estilos globales
│   │   └── favicon.ico
│   │
│   ├── components/            # Componentes React
│   │   │
│   │   ├── ui/               # Componentes shadcn/ui (35+)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── animated-card.tsx      # Tarjeta con efecto 3D
│   │   ├── animated-map.tsx       # Mapa animado decorativo
│   │   ├── countdown.tsx          # Countdown con círculo
│   │   ├── driver-profile-card.tsx
│   │   ├── icons.tsx              # Logo del proyecto
│   │   ├── leaflet-map.tsx        # Mapa Leaflet interactivo
│   │   ├── logout-dialog.tsx
│   │   ├── providers.tsx          # Root providers
│   │   ├── qr-code-dialog.tsx
│   │   ├── report-charts.tsx      # Gráficos Recharts
│   │   ├── survey-dialog.tsx      # Encuesta post-viaje
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── weather-widget.tsx
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   └── lib/                   # Utilidades y configuración
│       ├── firebase/
│       │   └── config.ts      # Configuración Firebase
│       ├── audio.ts           # Sistema de audio
│       ├── data.ts            # Datos iniciales
│       └── utils.ts           # Utilidades generales (cn)
│
├── .env                        # Variables de entorno
├── .gitignore
├── apphosting.yaml            # Configuración Firebase App Hosting
├── components.json            # Configuración shadcn/ui
├── firebase.json              # Configuración Firebase
├── next.config.ts             # Configuración Next.js
├── package.json               # Dependencias y scripts
├── postcss.config.mjs         # Configuración PostCSS
├── README.md                  # README del proyecto
├── tailwind.config.ts         # Configuración Tailwind
└── tsconfig.json              # Configuración TypeScript
```

### Descripción de Carpetas Clave

#### `/src/app` - Next.js App Router
Contiene toda la estructura de routing basada en carpetas. Cada carpeta con un `page.tsx` se convierte en una ruta accesible.

- **Características:**
  - File-based routing
  - Nested layouts
  - Server Components por defecto
  - Loading UI con `loading.tsx`
  - Route groups con `()`

#### `/src/components` - Componentes Reutilizables
- **`/ui`:** Componentes de shadcn/ui (Radix UI + Tailwind)
- **Root level:** Componentes personalizados del proyecto

#### `/ai` - Google Genkit
Flujos de inteligencia artificial completamente separados del código principal.

- **`genkit.ts`:** Configuración de Genkit con Gemini
- **`flows/`:** Definición de flujos (TTS, etc.)

#### `/functions` - Firebase Cloud Functions
Next.js se despliega como una Cloud Function serverless.

---

## Configuración Técnica

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/ai/*": ["./ai/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "ai/**/*"],
  "exclude": ["node_modules"]
}
```

**Características clave:**
- **Strict mode:** Activado para máxima seguridad de tipos
- **Path aliases:** `@/*` para `/src` y `@/ai/*` para `/ai`
- **Target ES2017:** Balance entre compatibilidad y features modernas
- **Incremental compilation:** Para builds más rápidos

### Next.js (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Para despliegues rápidos
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },
};

export default nextConfig;
```

**Características:**
- Bypass de errores TypeScript/ESLint en build (producción)
- Imágenes remotas permitidas de placehold.co y postimg.cc
- Turbopack en desarrollo automático

### Tailwind CSS (`tailwind.config.ts`)

```typescript
{
  darkMode: ["class"],  // Dark mode por clase CSS
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Sistema de colores con CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... más colores
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'bus-move': { /* animación de bus */ },
        'weather-cloud': { /* animación de nube */ },
        // ... más animaciones
      },
      animation: {
        'bus-move': 'bus-move 3s ease-in-out infinite',
        'weather-cloud': 'weather-cloud 5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Características:**
- **Dark mode:** Por clase CSS (`.dark`)
- **Fuente Poppins:** Para todo el texto
- **CSS Variables:** Para colores dinámicos
- **Animaciones personalizadas:** Para buses y clima
- **Plugin animate:** Animaciones pre-definidas

### shadcn/ui (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,  // React Server Components
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Características:**
- **Estilo New York:** Variante moderna de shadcn/ui
- **RSC enabled:** Soporte para React Server Components
- **CSS Variables:** Para temas dinámicos
- **Aliases:** Importaciones limpias

### Firebase (`firebase.json`)

```json
{
  "hosting": {
    "public": ".next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs18"
    }
  ]
}
```

**Características:**
- **Hosting:** Apunta a `.next` (build de Next.js)
- **Functions:** Node.js 18
- **Project ID:** studio-5170547963-be9ad

---

## Patrones de Diseño

### 1. Context Pattern

**Uso:** Gestión de estado global sin prop drilling

**Ejemplo:** `UsuarioProvider`

```typescript
// src/app/usuario/usuario-provider.tsx
export function UsuarioProvider({ children }) {
  const [buses, setBuses] = useState<Bus[]>(initialBusesData);
  const [notified, setNotified] = useState(false);
  // ... más estado

  return (
    <UsuarioContext.Provider value={{ buses, notified, ... }}>
      {children}
    </UsuarioContext.Provider>
  );
}

// Hook personalizado
export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error('useUsuario must be used within UsuarioProvider');
  return context;
};
```

**Ventajas:**
- Sin dependencias externas
- Type-safe con TypeScript
- Scope local (solo en `/usuario`)

### 2. Compound Components

**Uso:** Componentes UI de shadcn/ui

**Ejemplo:** Card component

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

**Ventajas:**
- Composición flexible
- API declarativa
- Estilos consistentes

### 3. Dynamic Imports

**Uso:** Componentes que requieren APIs del navegador

**Ejemplo:** Leaflet Map

```tsx
const LeafletMap = dynamic(
  () => import('@/components/leaflet-map').then(m => m.LeafletMap),
  { ssr: false }  // Deshabilita Server-Side Rendering
);
```

**Razón:** Leaflet depende de `window`, que no existe en el servidor.

### 4. Custom Hooks

**Uso:** Lógica reutilizable

**Ejemplos:**
- `useToast()` - Notificaciones toast
- `useMobile()` - Detección de dispositivo móvil
- `useUsuario()` - Estado del usuario

### 5. Server Actions

**Uso:** Operaciones del servidor desde el cliente

**Ejemplo:** Text-to-Speech

```typescript
'use server';  // Marca como Server Action

export async function generateSpeech(text: string) {
  return generateSpeechFlow(text);
}
```

**Llamado desde el cliente:**

```tsx
"use client";

import { generateSpeech } from './actions';

const audio = await generateSpeech("Hola");
```

---

## Arquitectura de Componentes

### Jerarquía de Componentes

```
Layout Raíz (app/layout.tsx)
├── Providers (ThemeProvider)
└── {children}
    │
    ├── Dashboard (app/dashboard/layout.tsx)
    │   ├── SidebarProvider
    │   │   ├── Sidebar
    │   │   │   ├── SidebarHeader (Logo)
    │   │   │   ├── SidebarContent (Menu)
    │   │   │   └── SidebarFooter (Logout)
    │   │   └── SidebarInset
    │   │       ├── Header
    │   │       │   ├── SidebarTrigger
    │   │       │   ├── ThemeToggle
    │   │       │   └── DropdownMenu (Usuario)
    │   │       ├── Main ({children})
    │   │       └── Footer
    │   │
    │   └── Páginas del Dashboard
    │       ├── Panel GPS (LeafletMap, Cards, Charts)
    │       ├── Solicitudes (Tabs, Tables)
    │       ├── Rutas (CRUD, Formularios)
    │       └── ... (15 páginas)
    │
    ├── Usuario (app/usuario/layout.tsx)
    │   ├── UsuarioProvider (Context)
    │   └── {children}
    │       ├── Inicio
    │       │   ├── AnimatedMap
    │       │   ├── BusSelector
    │       │   ├── Countdown
    │       │   ├── WeatherWidget
    │       │   ├── AlertDialog (proximidad)
    │       │   └── SurveyDialog
    │       ├── Horarios
    │       │   └── Accordion (rutas)
    │       ├── Historial
    │       │   └── TravelList
    │       └── Perfil
    │
    └── Vista Bus (app/vista-bus/page.tsx)
        ├── Reloj Digital
        ├── Controles de Ruta
        ├── Estado del Bus
        └── WeatherWidget
```

### Server Components vs Client Components

**Server Components (por defecto):**
- Cualquier component sin `"use client"`
- Puede hacer fetch directo de datos
- No puede usar hooks o event handlers
- Se renderizan en el servidor

**Client Components:**
- Con `"use client"` al inicio
- Puede usar todos los hooks
- Puede manejar eventos del usuario
- Se hidratan en el cliente

**Ejemplo de división:**

```tsx
// page.tsx - Server Component
export default async function Page() {
  const data = await fetchData();  // Directo en el servidor

  return <ClientComponent data={data} />;
}

// client-component.tsx - Client Component
"use client";

export function ClientComponent({ data }) {
  const [state, setState] = useState(data);

  return <button onClick={() => setState(...)}>Click</button>;
}
```

---

## Sistema de Routing

### Next.js App Router

**Convenciones de archivos:**

| Archivo | Propósito |
|---------|-----------|
| `layout.tsx` | Layout compartido (persiste entre navegaciones) |
| `page.tsx` | Página única accesible vía URL |
| `loading.tsx` | UI de carga (Suspense automático) |
| `error.tsx` | Boundary de errores |
| `not-found.tsx` | Página 404 |
| `route.ts` | API Route (sin UI) |

**Ejemplo de rutas:**

```
app/
├── layout.tsx           → Layout raíz (aplica a todas)
├── page.tsx             → /
├── dashboard/
│   ├── layout.tsx       → Layout de dashboard
│   ├── page.tsx         → /dashboard
│   └── rutas/
│       └── page.tsx     → /dashboard/rutas
└── usuario/
    ├── layout.tsx       → Layout de usuario
    ├── page.tsx         → /usuario
    └── historial/
        ├── page.tsx     → /usuario/historial
        └── [id]/
            └── page.tsx → /usuario/historial/123
```

### Navegación

**Componente Link:**

```tsx
import Link from 'next/link';

<Link href="/dashboard/rutas">
  Gestión de Rutas
</Link>
```

**Router programático:**

```tsx
"use client";
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/usuario');
router.replace('/usuario');  // Sin agregar a historial
router.back();
```

---

## Sistema de Audio

**Archivo:** `src/lib/audio.ts`

### Funciones Disponibles

```typescript
// Sonido de éxito
export function playSuccessSound() {
  const audio = new Audio('/audio/success.mp3');
  audio.play();
}

// Sonido de error
export function playErrorSound() {
  const audio = new Audio('/audio/error.mp3');
  audio.play();
}

// Sonido en loop (alerta)
let loopingAudio: HTMLAudioElement | null = null;

export function playLoopingAlertSound() {
  loopingAudio = new Audio('/audio/alert.mp3');
  loopingAudio.loop = true;
  loopingAudio.play();
}

export function stopLoopingAlertSound() {
  if (loopingAudio) {
    loopingAudio.pause();
    loopingAudio.currentTime = 0;
    loopingAudio = null;
  }
}
```

### Uso

```tsx
import { playSuccessSound, playLoopingAlertSound, stopLoopingAlertSound } from '@/lib/audio';

// Notificación exitosa
playSuccessSound();

// Alerta de proximidad
if (countdownSeconds === 20) {
  playLoopingAlertSound();
}

// Detener alerta
stopLoopingAlertSound();
```

---

## Integración con Firebase

### Configuración

**Archivo:** `src/lib/firebase/config.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  projectId: "studio-5170547963-be9ad",
  appId: "1:486787755882:web:422762397b8e4ab390ff13",
  apiKey: "AIzaSyDFzBFfkZKJe9B5eUexooStY3OUQkOoxFY",
  authDomain: "studio-5170547963-be9ad.firebaseapp.com",
};

// Evitar inicializar múltiples veces
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export default app;
```

### Servicios Utilizados

1. **Firebase Hosting:**
   - Aloja el build de Next.js (`.next`)
   - Servidor con HTTP/2
   - CDN global

2. **Cloud Functions:**
   - Next.js como función serverless
   - Node.js 18
   - Auto-escalado

3. **Firestore** (futuro):
   - Base de datos NoSQL
   - Tiempo real con listeners
   - Offline support

### Deploy

```bash
# Build de Next.js
npm run build

# Deploy completo
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions
```

---

## Integración con Google Genkit

### Arquitectura de Genkit

```mermaid
graph LR
    Client[Cliente Web] -->|"generateSpeech(text)"| SA[Server Action]
    SA -->|Invoca| Flow[tts-flow.ts]
    Flow -->|"ai.generate()"| Genkit[Google Genkit]
    Genkit -->|Solicitud| Gemini[Gemini 2.5 Flash TTS]
    Gemini -->|"Audio PCM"| Genkit
    Genkit -->|media.url| Flow
    Flow -->|"toWav()"| Flow
    Flow -->|"Audio WAV base64"| SA
    SA -->|Response| Client
```

### Configuración

**Archivo:** `ai/genkit.ts`

```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash-preview-tts',
});
```

### Flujo TTS

**Archivo:** `ai/flows/tts-flow.ts`

```typescript
export const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: z.string(),
    outputSchema: z.any(),
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Achernar' },
          },
        },
      },
      prompt: query,
    });

    // Conversión PCM a WAV
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
```

### Desarrollo

```bash
# Terminal 1: Genkit UI
npm run genkit:dev
# Abre http://localhost:4000

# Terminal 2: Next.js
npm run dev
```

---

## Diagramas de Arquitectura

### Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[Next.js App Router<br/>React 18]
        Components[Componentes UI<br/>shadcn/ui + custom]
        Maps[Leaflet Maps<br/>Dynamic Import]
    end

    subgraph "Gestión de Estado"
        Context[UsuarioProvider<br/>Context API]
        LocalStorage[localStorage<br/>Persistencia]
    end

    subgraph "Backend (Firebase)"
        Hosting[Firebase Hosting<br/>Next.js SSR]
        Functions[Cloud Functions<br/>Serverless]
        Firestore[(Firestore<br/>Database)]
    end

    subgraph "Inteligencia Artificial"
        Genkit[Google Genkit<br/>AI Framework]
        Gemini[Gemini 2.5 Flash TTS<br/>Text-to-Speech]
    end

    UI --> Components
    Components --> Maps
    UI --> Context
    Context --> LocalStorage
    UI --> Hosting
    Hosting --> Functions
    Functions --> Firestore
    UI -.TTS.-> Genkit
    Genkit --> Gemini
```

### Flujo de Rendering

```mermaid
sequenceDiagram
    participant Browser
    participant NextServer as Next.js Server
    participant RSC as React Server Components
    participant Firebase

    Browser->>NextServer: Request /dashboard
    NextServer->>RSC: Render Server Components
    RSC->>Firebase: Fetch data (si necesario)
    Firebase-->>RSC: Datos
    RSC-->>NextServer: HTML + RSC Payload
    NextServer-->>Browser: HTML inicial (SSR)
    Browser->>Browser: Hidratación de Client Components
    Browser->>Browser: Página interactiva
```

### Arquitectura de Datos

```mermaid
graph TD
    subgraph "Frontend State"
        React[React State<br/>useState]
        Context[Context API<br/>UsuarioProvider]
        LS[localStorage<br/>Persistencia local]
    end

    subgraph "Backend State"
        Firestore[(Firestore<br/>Database)]
        Functions[Cloud Functions<br/>API Logic]
    end

    React --> Context
    Context <--> LS
    Context <--> Functions
    Functions <--> Firestore
```

---

## Performance y Optimizaciones

### Turbopack

- Bundler ultra-rápido de Next.js
- Hot Module Replacement (HMR) instantáneo
- Automático en modo desarrollo

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/avatar.png"
  width={40}
  height={40}
  alt="Avatar"
  // Optimización automática de Next.js
/>
```

### Code Splitting

- Automático por ruta
- Dynamic imports para componentes pesados
- Lazy loading de componentes

### Font Optimization

- Fuente Poppins via Tailwind config
- Font files auto-optimizados por Next.js

---

## Seguridad

### Type Safety

- TypeScript estricto en todo el proyecto
- Validación con Zod en formularios
- Props tipadas en todos los componentes

### Server-Side Logic

- Operaciones críticas en Server Components
- Server Actions para mutaciones
- API Keys en variables de entorno

### Content Security

- Firebase Security Rules (futuro)
- Validación de entrada en cliente y servidor
- Sanitización de datos

---

## Conclusión

CESAC es una aplicación moderna que aprovecha las últimas tecnologías del ecosistema React/Next.js:

- **Arquitectura escalable** con App Router
- **Type safety** con TypeScript
- **Performance** con Server Components y Turbopack
- **UI moderna** con Tailwind y shadcn/ui
- **Backend serverless** con Firebase
- **IA integrada** con Google Genkit

Para más información, consulta:
- [entidades.md](./entidades.md) - Modelos de datos
- [componentes.md](./componentes.md) - Catálogo de componentes
- [guia-desarrollo.md](./guia-desarrollo.md) - Guía de desarrollo

---

**Próximos Pasos:**
- Implementar Firebase Firestore para datos en tiempo real
- Agregar autenticación de usuarios
- Optimizar performance con React Compiler
- Agregar tests unitarios e integración

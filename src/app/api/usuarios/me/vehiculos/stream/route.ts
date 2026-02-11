import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { eventBus } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Validar sesión
  const session = await getSession();
  if (!session || session.tipo !== 'usuario') {
    return new Response('Unauthorized', { status: 401 });
  }

  const rutaAsignada = session.rutaAsignada;
  if (!rutaAsignada) {
    return new Response('No route assigned', { status: 400 });
  }

  // Crear stream SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Enviar comentario de keep-alive cada 30 segundos
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Escuchar eventos de actualización de vehículos
      const unsubscribe = eventBus.subscribe('vehiculo-update', (data) => {
        // Solo enviar si el vehículo pertenece a la ruta del usuario
        if (data.rutaAsignada === rutaAsignada) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        }
      });

      // Cleanup al cerrar conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

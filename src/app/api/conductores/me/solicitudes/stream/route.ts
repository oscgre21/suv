import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { eventBus } from '@/lib/event-bus';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.tipo !== 'conductor' || !session.conductorId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Obtener la ruta asignada del conductor
  const conductor = await prisma.conductor.findUnique({
    where: { id: session.conductorId },
    select: {
      vehiculo: {
        select: { rutaAsignada: true },
      },
    },
  });

  const rutaAsignada = conductor?.vehiculo?.rutaAsignada;
  if (!rutaAsignada) {
    return new Response('No route assigned', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Escuchar eventos de nuevas solicitudes de parada
      const unsubscribe = eventBus.subscribe('solicitud-update', (data) => {
        if (data.rutaId === rutaAsignada) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        }
      });

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

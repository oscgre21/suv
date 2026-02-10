
"use client";

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/leaflet-map').then(m => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Cargando mapa...</p></div>
});

export function AnimatedMap(props: any) {
    return <LeafletMap {...props} />;
}

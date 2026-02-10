
"use client";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Route, Bus, GanttChartSquare, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/animated-card";

const dataMasterItems = [
    {
        title: "Conductores",
        description: "Gestionar el personal de conducción.",
        icon: User,
        href: "/dashboard/data-master/conductores",
        className: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-500",
    },
    {
        title: "Rutas",
        description: "Definir y administrar las rutas estándar.",
        icon: Route,
        href: "/dashboard/data-master/rutas",
        className: "from-green-500/20 to-green-500/5",
        iconColor: "text-green-500",
    },
    {
        title: "Vehículos (Buses)",
        description: "Administrar la flota de vehículos.",
        icon: Bus,
        href: "/dashboard/data-master/vehiculos",
        className: "from-purple-500/20 to-purple-500/5",
        iconColor: "text-purple-500",
    },
    {
        title: "Estatus de Vehículos",
        description: "Configurar los estados de los vehículos.",
        icon: GanttChartSquare,
        href: "/dashboard/data-master/estatus-vehiculo",
        className: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-500",
    },
    {
        title: "Rutas Especiales",
        description: "Gestionar rutas para eventos o necesidades puntuales.",
        icon: Star,
        href: "/dashboard/data-master/rutas-especiales",
        className: "from-amber-500/20 to-amber-500/5",
        iconColor: "text-amber-500",
    },
];


export default function DataMasterPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Data Master</h1>
            <p className="text-muted-foreground">
                Panel central para la configuración y gestión de los datos maestros del sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dataMasterItems.map((item) => (
                    <AnimatedCard key={item.title} href={item.href} glowClassName={item.className}>
                         <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className={cn("p-3 rounded-lg border bg-card/80", item.iconColor)}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow pt-4">
                            <CardDescription>{item.description}</CardDescription>
                        </CardContent>
                    </AnimatedCard>
                ))}
            </div>
        </div>
    );
}

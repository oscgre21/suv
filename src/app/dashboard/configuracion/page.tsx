
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ConfiguracionPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-headline">Configuración</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                    <CardDescription>Gestiona cómo y cuándo recibes notificaciones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="new-request-notifications" className="font-medium">Nuevas Solicitudes</Label>
                            <p className="text-sm text-muted-foreground">Recibir una notificación por cada nueva solicitud de parada.</p>
                        </div>
                        <Switch id="new-request-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                         <div>
                            <Label htmlFor="system-alerts-notifications" className="font-medium">Alertas del Sistema</Label>
                            <p className="text-sm text-muted-foreground">Notificaciones sobre mantenimientos o problemas con vehículos.</p>
                        </div>
                        <Switch id="system-alerts-notifications" defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

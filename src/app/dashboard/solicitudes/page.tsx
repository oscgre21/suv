import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const requests = {
  charles: [
    { id: 1, employee: 'Juan Perez', stop: 'Av. Sabana Larga esq. Curazao', time: '06:45 AM', status: 'Confirmado' },
    { id: 2, employee: 'Maria Rodriguez', stop: 'Puente Juan Carlos', time: '07:00 AM', status: 'Confirmado' },
    { id: 3, employee: 'Carlos Gomez', stop: 'Estación Concepción Bona', time: '07:10 AM', status: 'No recogido' },
  ],
  duarte: [
    { id: 4, employee: 'Ana Martinez', stop: 'Km 9 Autopista Duarte', time: '06:30 AM', status: 'Confirmado' },
    { id: 5, employee: 'Pedro Jimenez', stop: 'Av. John F. Kennedy esq. Lope de Vega', time: '06:55 AM', status: 'Cancelado' },
    { id: 6, employee: 'Laura Sanchez', stop: 'Plaza de la Bandera', time: '07:15 AM', status: 'Confirmado' },
  ]
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Confirmado':
      return 'default';
    case 'No recogido':
      return 'destructive';
    case 'Cancelado':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function SolicitudesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Solicitudes y Paradas</h1>

      <Tabs defaultValue="charles">
        <TabsList>
          <TabsTrigger value="charles">Ruta Charles</TabsTrigger>
          <TabsTrigger value="duarte">Ruta Duarte</TabsTrigger>
          <TabsTrigger value="independencia">Ruta Independencia</TabsTrigger>
          <TabsTrigger value="historial">Historial de Abordaje</TabsTrigger>
        </TabsList>
        <TabsContent value="charles">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes - Ruta Charles</CardTitle>
              <CardDescription>Solicitudes de paradas de empleados en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Parada Solicitada</TableHead>
                    <TableHead>Hora de Solicitud</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.charles.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employee}</TableCell>
                      <TableCell>{req.stop}</TableCell>
                      <TableCell>{req.time}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="duarte">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes - Ruta Duarte</CardTitle>
              <CardDescription>Solicitudes de paradas de empleados en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Parada Solicitada</TableHead>
                    <TableHead>Hora de Solicitud</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.duarte.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employee}</TableCell>
                      <TableCell>{req.stop}</TableCell>
                      <TableCell>{req.time}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="independencia">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes - Ruta Independencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay solicitudes para esta ruta.</p>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Abordaje</CardTitle>
              <CardDescription>Registro histórico de todas las solicitudes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>El historial de abordaje estará disponible en una futura actualización.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

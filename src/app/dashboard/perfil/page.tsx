
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

export default function PerfilPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Perfil de Usuario</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <div className="relative">
                                <Avatar className="w-24 h-24 mb-2">
                                    <AvatarImage src="https://placehold.co/96x96.png" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                    <Camera className="h-4 w-4"/>
                                    <span className="sr-only">Cambiar foto</span>
                                </Button>
                            </div>
                            <CardTitle className="text-2xl">Admin</CardTitle>
                            <CardDescription>Administrador del Sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" variant="outline">Cambiar Contraseña</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Cuenta</CardTitle>
                            <CardDescription>Edita tu información personal aquí.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" defaultValue="Admin" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" defaultValue="admin@suv.com" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Input id="role" defaultValue="Administrador" disabled />
                            </div>
                             <div className="flex justify-end">
                                <Button>Guardar Cambios</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

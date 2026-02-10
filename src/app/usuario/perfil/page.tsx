
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, LogOut } from "lucide-react";
import { LogoutDialog } from "@/components/logout-dialog";

export default function PerfilUsuarioPage() {
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    return (
        <>
        <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
        <div className="flex flex-col gap-6 p-4">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader className="items-center text-center">
                        <div className="relative">
                            <Avatar className="w-24 h-24 mb-2">
                                <AvatarImage src="https://placehold.co/96x96.png" data-ai-hint="person portrait" />
                                <AvatarFallback>KQ</AvatarFallback>
                            </Avatar>
                            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                <Camera className="h-4 w-4"/>
                                <span className="sr-only">Cambiar foto</span>
                            </Button>
                        </div>
                        <CardTitle className="text-2xl">Kendy Qualey</CardTitle>
                        <CardDescription>CESAC-DEV-001</CardDescription>
                    </CardHeader>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" defaultValue="Kendy Qualey" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" defaultValue="kendy.qualey@cesac.mil.do" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="route">Ruta Asignada</Label>
                        <Input id="route" defaultValue="Charles de Gaulle" disabled />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">Cambiar Contraseña</Button>
                </CardContent>
            </Card>

            <div className="mt-4">
                 <Button className="w-full" variant="destructive" onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
        </>
    );
}

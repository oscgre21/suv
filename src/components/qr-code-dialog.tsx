
"use client";

import React from 'react';
import QRCode from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrCodeDialogProps {
  qrValue: string;
  trigger: React.ReactNode;
}

export function QrCodeDialog({ qrValue, trigger }: QrCodeDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue);
    toast({
      title: "Enlace Copiado",
      description: "El enlace a la vista de usuario ha sido copiado al portapapeles.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acceso a la Vista de Usuario</DialogTitle>
          <DialogDescription>
            Escanee este código QR con un smartphone para abrir la vista de usuario móvil.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-white rounded-lg">
          <QRCode
            value={qrValue}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className="flex items-center space-x-2">
            <Input id="link" defaultValue={qrValue} readOnly className="flex-1" />
            <Button type="button" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copiar Enlace</span>
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}

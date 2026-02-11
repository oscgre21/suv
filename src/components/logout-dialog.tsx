
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setCountdown(3); // Reset countdown when dialog opens
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Clear any session data from localStorage
            localStorage.clear();
            // Redirect to login
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="sr-only">Cerrando Sesión</DialogTitle>
          <DialogDescription className="sr-only">Será redirigido en breve.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
          <LogOut className="w-16 h-16 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold">Cerrando Sesión</h2>
          <p className="text-muted-foreground">
            Gracias por usar el sistema. Serás redirigido en...
          </p>
          <div className="text-4xl font-bold font-mono text-primary">
            {countdown}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

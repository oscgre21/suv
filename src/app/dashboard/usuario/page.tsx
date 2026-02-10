
import UsuarioPageContent from '@/app/usuario/page';
import { UsuarioProvider } from '@/app/usuario/usuario-provider';

export default function UsuarioDashboardPage() {
  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)] w-full rounded-lg border-t sm:border overflow-hidden bg-muted">
        <UsuarioProvider>
            <UsuarioPageContent />
        </UsuarioProvider>
    </div>
  );
}

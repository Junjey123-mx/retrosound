'use client';

import { useRouter } from 'next/navigation';
import { Disc3, ShieldOff } from 'lucide-react';
import { clearSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand/25 bg-brand/8">
            <ShieldOff className="h-8 w-8 text-brand" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Acceso denegado</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          No tienes permiso para acceder a esta sección.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full py-3 text-sm font-semibold"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </Button>
          <Button
            variant="outline"
            className="w-full py-3 text-sm font-semibold"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-muted-foreground">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-brand/30 bg-brand/6">
          <Disc3 className="h-3 w-3 text-brand" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest">RetroSound Store</span>
      </div>
    </main>
  );
}

'use client';

import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { Mail, Shield, LogOut } from 'lucide-react';

const avatarColor: Record<string, string> = {
  admin:     'bg-purple-500',
  empleado:  'bg-blue-500',
  cliente:   'bg-green-500',
  proveedor: 'bg-orange-500',
};

const roleMeta: Record<string, { badge: string; label: string }> = {
  admin:     { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', label: 'Administrador' },
  empleado:  { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',         label: 'Empleado' },
  cliente:   { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',     label: 'Cliente' },
  proveedor: { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', label: 'Proveedor' },
};

export default function PerfilPage() {
  const user   = useCurrentUser();
  const logout = useLogout();

  if (!user) {
    return (
      <main className="p-8">
        <p className="text-muted-foreground">Cargando perfil…</p>
      </main>
    );
  }

  const avColor  = avatarColor[user.rol] ?? 'bg-gray-500';
  const meta     = roleMeta[user.rol] ?? { badge: 'bg-gray-100 text-gray-700', label: user.rol };
  const initials = user.correo.slice(0, 1).toUpperCase();

  return (
    <main className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Información de tu cuenta en RetroSound.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">

        {/* Avatar + nombre */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${avColor} text-2xl font-bold text-white select-none`}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{user.correo}</p>
            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
        </div>

        <hr className="border-border" />

        {/* Detalles */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Correo electrónico</p>
              <p className="text-sm font-medium text-foreground">{user.correo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Rol en el sistema</p>
              <p className="text-sm font-medium text-foreground">{meta.label}</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>

    </main>
  );
}

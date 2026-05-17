'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { LogOut, Mail, Shield } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const roleLabel: Record<string, string> = {
  admin:               'Administrador',
  empleado_ventas:     'Emp. Ventas',
  empleado_inventario: 'Emp. Inventario',
  empleado:            'Empleado',
  cliente:             'Cliente',
  proveedor:           'Proveedor',
};

export function ProfilePanel() {
  const user = useCurrentUser();
  const logout = useLogout();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : false;
  const brandColor = isDark ? '#00E676' : '#F97316';

  if (!user) {
    return (
      <main className="p-8">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </main>
    );
  }

  const label = roleLabel[user.rol] ?? user.rol;
  const initials = user.correo.slice(0, 1).toUpperCase();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Información de tu cuenta en RetroSound.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: brandColor, color: isDark ? '#08111F' : '#ffffff' }}
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold select-none"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{user.correo}</p>
            <Badge variant="default">{label}</Badge>
          </div>
        </div>

        <hr className="my-6 border-border" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Correo electrónico</p>
              <p className="text-sm font-medium text-foreground">{user.correo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Rol en el sistema</p>
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
          </div>
        </div>

        <hr className="my-6 border-border" />

        <Button variant="destructive" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </main>
  );
}

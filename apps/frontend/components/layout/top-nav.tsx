'use client';

import Link from 'next/link';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

const roleBadge: Record<string, string> = {
  admin:     'bg-purple-100 text-purple-800',
  empleado:  'bg-blue-100 text-blue-800',
  cliente:   'bg-green-100 text-green-800',
  proveedor: 'bg-orange-100 text-orange-800',
};

export function TopNav() {
  const user   = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold">
          RetroSound
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm hover:underline">
            Inicio
          </Link>
          <Link href="/dashboard/productos" className="text-sm hover:underline">
            Productos
          </Link>
          <Link href="/dashboard/ventas" className="text-sm hover:underline">
            Ventas
          </Link>
          <Link href="/dashboard/proveedores" className="text-sm hover:underline">
            Proveedores
          </Link>
          <Link href="/dashboard/reportes" className="text-sm hover:underline">
            Reportes
          </Link>

          {user && (
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-muted-foreground">{user.correo}</span>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${roleBadge[user.rol] ?? 'bg-gray-100 text-gray-800'}`}>
                {user.rol}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}

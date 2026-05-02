'use client';

import Link from 'next/link';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, Disc3 } from 'lucide-react';

const roleBadge: Record<string, string> = {
  admin:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  empleado:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  cliente:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  proveedor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export function TopNav() {
  const user   = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
          <Disc3 className="h-5 w-5 text-green-500" />
          <span>RetroSound</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">Inicio</Link>
          <Link href="/dashboard/productos" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">Productos</Link>
          <Link href="/dashboard/ventas" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">Ventas</Link>
          <Link href="/dashboard/proveedores" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">Proveedores</Link>
          <Link href="/dashboard/reportes" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">Reportes</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.correo}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadge[user.rol] ?? 'bg-gray-100 text-gray-700'}`}>
                {user.rol}
              </span>
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>

      </div>
    </header>
  );
}

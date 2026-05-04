'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, Disc3 } from 'lucide-react';


export function TopNav() {
  const user     = useCurrentUser();
  const logout   = useLogout();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark      = mounted ? theme === 'dark' : false;
  const brandColor  = isDark ? '#00E676' : '#F97316';
  const initials    = user ? user.correo.slice(0, 1).toUpperCase() : '?';

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  const navCls = (href: string) =>
    isActive(href)
      ? 'rs-nav-active relative rounded-xl border border-slate-700 px-3 py-1.5 text-sm font-semibold shadow-sm transition-all duration-150'
      : 'rs-nav-item rs-nav-muted relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-150';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground transition-colors hover:text-brand">
          <Disc3 className="rs-logo-mark h-5 w-5" />
          <span>RetroSound</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          <Link href="/dashboard"             className={navCls('/dashboard')}>Inicio</Link>
          <Link href="/dashboard/productos"   className={navCls('/dashboard/productos')}>Productos</Link>
          <Link href="/dashboard/ventas"      className={navCls('/dashboard/ventas')}>Ventas</Link>
          <Link href="/dashboard/proveedores" className={navCls('/dashboard/proveedores')}>Proveedores</Link>
          <Link href="/dashboard/reportes"    className={navCls('/dashboard/reportes')}>Reportes</Link>
        </nav>

        {/* Derecha */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <Link
              href="/dashboard/perfil"
              className="flex items-center gap-2 rounded-xl px-2 py-1 rs-hover-brand hover:text-brand"
              aria-label="Ver mi perfil"
            >
              <div
                style={{ backgroundColor: brandColor }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white select-none"
                aria-hidden="true"
              >
                {initials}
              </div>
            </Link>
          )}

          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-1.5 rounded-xl border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
}

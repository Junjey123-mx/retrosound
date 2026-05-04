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

  const NAV_LINKS = [
    { href: '/dashboard',             label: 'Inicio'      },
    { href: '/dashboard/productos',   label: 'Productos'   },
    { href: '/dashboard/ventas',      label: 'Ventas'      },
    { href: '/dashboard/proveedores', label: 'Proveedores' },
    { href: '/dashboard/reportes',    label: 'Reportes'    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground transition-colors hover:text-brand">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border-2"
            style={{ borderColor: brandColor, backgroundColor: isDark ? 'rgba(0,230,118,0.10)' : 'rgba(249,115,22,0.08)' }}
          >
            <Disc3 className="rs-logo-mark h-4 w-4" />
          </div>
          <span>RetroSound</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href as any}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${active ? 'rs-nav-active rounded-xl' : 'rs-nav-item rs-nav-muted rounded-xl'}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Derecha */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <Link
              href="/dashboard/perfil"
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white select-none transition-opacity hover:opacity-80"
              style={{ backgroundColor: brandColor, color: isDark ? '#080F1A' : '#ffffff' }}
              aria-label="Ver mi perfil"
            >
              {initials}
            </Link>
          )}

          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="rs-btn-logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
}

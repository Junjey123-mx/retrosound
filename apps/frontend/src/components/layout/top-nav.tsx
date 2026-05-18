'use client';

import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, Disc3 } from 'lucide-react';


export function TopNav() {
  const user     = useCurrentUser();
  const logout   = useLogout();
  const { pathname } = useLocation();
  const initials    = user ? user.correo.slice(0, 1).toUpperCase() : '?';

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(`${href}/`);

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
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-foreground transition-colors hover:text-brand">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand"
            style={{ backgroundColor: 'var(--brand-soft)' }}
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
                to={href as any}
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
              to="/dashboard/perfil"
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold select-none transition-opacity hover:opacity-80 bg-brand text-brand-foreground"
              aria-label="Ver mi perfil"
            >
              {initials}
            </Link>
          )}

          <button
            type="button"
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useCarritoItemCount } from '@/hooks/use-carrito';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LogOut, Disc3, ShoppingCart } from 'lucide-react';

export function ClientNavbar() {
  const user = useCurrentUser();
  const logout = useLogout();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCarritoItemCount();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : false;
  const brandColor = isDark ? '#00E676' : '#F97316';
  const initials = user ? user.correo.slice(0, 1).toUpperCase() : '?';
  const cartActive = pathname.startsWith('/carrito');
  const profileActive = pathname.startsWith('/perfil');

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const NAV_LINKS = [
    { href: '/tienda', label: 'Tienda' },
    { href: '/mis-ordenes', label: 'Mis órdenes' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href={"/tienda" as any}
          className="flex items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border-2"
            style={{
              borderColor: brandColor,
              backgroundColor: isDark ? 'rgba(0,230,118,0.10)' : 'rgba(249,115,22,0.08)',
            }}
          >
            <Disc3 className="rs-logo-mark h-4 w-4" />
          </div>
          <span>RetroSound</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación cliente">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href as any}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  active ? 'rs-nav-active rounded-xl' : 'rs-nav-item rs-nav-muted rounded-xl'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href={"/carrito" as any}
            className={`rs-btn-cart relative ${cartActive ? 'rs-btn-cart-active' : ''}`}
            aria-label="Carrito"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{
                  backgroundColor: brandColor,
                  color: isDark ? '#08111F' : '#ffffff',
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {user && (
            <Link
              href={"/perfil" as any}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white select-none transition-opacity hover:opacity-80 ${
                profileActive ? 'ring-2 ring-brand/35 ring-offset-2 ring-offset-background' : ''
              }`}
              style={{
                backgroundColor: brandColor,
                color: isDark ? '#080F1A' : '#ffffff',
              }}
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

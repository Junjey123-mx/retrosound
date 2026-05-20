'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useCarritoItemCount } from '@/hooks/use-carrito';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Disc3, LogOut, Menu, ShoppingCart, X } from 'lucide-react';
import { getNavItemsForRole, type NavItem } from '@/lib/constants/nav-items';
import { ROLES } from '@/lib/auth/roles';

function getHomeHref(rol: string): string {
  if (rol === ROLES.CLIENTE) return '/tienda';
  if (rol === ROLES.PROVEEDOR) return '/proveedor';
  return '/dashboard';
}

function getProfileHref(rol: string): string {
  if (rol === ROLES.CLIENTE) return '/perfil';
  if (rol === ROLES.PROVEEDOR) return '/proveedor/perfil';
  return '/dashboard/perfil';
}

export function isNavItemActive(pathname: string, itemPath: string, options?: { exact?: boolean }): boolean {
  if (options?.exact) return pathname === itemPath;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function getActiveNavKey(pathname: string, items: NavItem[]): string | null {
  const activeItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isNavItemActive(pathname, item.href, { exact: item.exact }));

  if (activeItems.length === 0) return null;

  activeItems.sort((a, b) => {
    const pathDiff = b.item.href.length - a.item.href.length;
    return pathDiff || a.index - b.index;
  });

  const { item, index } = activeItems[0];
  return `${item.href}-${item.label}-${index}`;
}

function CartBadge() {
  const cartCount = useCarritoItemCount();
  const { pathname } = useLocation();

  return (
    <Link
      to={'/carrito' as any}
      className={`rs-btn-cart relative ${pathname === '/carrito' || pathname.startsWith('/carrito/') ? 'rs-btn-cart-active' : ''}`}
      aria-label="Carrito"
    >
      <ShoppingCart className="h-4 w-4" />
      {cartCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
          style={{ backgroundColor: 'hsl(var(--brand))', color: 'var(--rs-bg)' }}
        >
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </Link>
  );
}

export function RoleNavbar() {
  const user     = useCurrentUser();
  const logout   = useLogout();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (!user) return null;

  const { rol, correo } = user;
  const initial      = correo.slice(0, 1).toUpperCase();
  const navItems     = getNavItemsForRole(rol);
  const activeNavKey = getActiveNavKey(pathname, navItems);
  const homeHref     = getHomeHref(rol);
  const profileHref  = getProfileHref(rol);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* ── Barra principal ── */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">

        {/* Logo */}
        <Link
          to={homeHref as any}
          className="flex shrink-0 items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand"
            style={{ backgroundColor: 'var(--brand-soft)' }}
          >
            <Disc3 className="rs-logo-mark h-4 w-4" />
          </div>
          <span className="hidden sm:inline">RetroSound</span>
        </Link>

        {/* Links — desktop/tablet: zona desplazable horizontalmente, centrada */}
        <nav
          className="scrollbar-hide hidden md:flex flex-1 min-w-0 overflow-x-auto items-center justify-center"
          aria-label="Navegación principal"
        >
          <div className="flex shrink-0 items-center gap-1">
            {navItems.map(({ href, label }, index) => {
              const active = activeNavKey === `${href}-${label}-${index}`;
              return (
                <Link
                  key={`${href}-${label}`}
                  to={href as any}
                  className={`shrink-0 whitespace-nowrap relative px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    active ? 'rs-nav-active rounded-xl' : 'rs-nav-item rs-nav-muted rounded-xl'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Espaciador móvil: empuja las acciones hacia la derecha cuando no hay nav */}
        <div className="flex-1 md:hidden" />

        {/* Acciones de usuario */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {rol === ROLES.CLIENTE && <CartBadge />}

          <Link
            to={profileHref as any}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold select-none transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'hsl(var(--brand))', color: 'hsl(var(--brand-foreground))' }}
            aria-label="Ver mi perfil"
          >
            {initial}
          </Link>

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

        {/* Botón hamburguesa — solo móvil */}
        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          className="md:hidden flex shrink-0 items-center justify-center rounded-lg p-1.5 text-foreground hover:bg-muted transition-colors"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

      </div>

      {/* ── Menú desplegable móvil ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {navItems.map(({ href, label }, index) => {
              const active = activeNavKey === `${href}-${label}-${index}`;
              return (
                <Link
                  key={`${href}-${label}`}
                  to={href as any}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active ? 'rs-nav-active rounded-xl' : 'rs-nav-item rs-nav-muted rounded-xl'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

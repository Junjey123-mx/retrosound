'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function TopNav() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

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
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}

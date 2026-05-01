'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Bienvenido a RetroSound Store</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/productos"
          className="rounded-lg border-2 border-blue-200 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          <div className="text-3xl">🎵</div>
          <h2 className="mt-3 text-lg font-semibold">Productos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de vinilos, CDs y casetes. Crear, editar y desactivar.
          </p>
        </Link>

        <Link
          href="/dashboard/proveedores"
          className="rounded-lg border-2 border-purple-200 p-6 transition-colors hover:border-purple-400 hover:bg-purple-50"
        >
          <div className="text-3xl">🏭</div>
          <h2 className="mt-3 text-lg font-semibold">Proveedores</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de proveedores del inventario. Crear, editar y desactivar.
          </p>
        </Link>

        <Link
          href="/dashboard/ventas"
          className="rounded-lg border-2 border-green-200 p-6 transition-colors hover:border-green-400 hover:bg-green-50"
        >
          <div className="text-3xl">🧾</div>
          <h2 className="mt-3 text-lg font-semibold">Ventas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de ventas registradas en el sistema.
          </p>
        </Link>
      </div>
    </main>
  );
}

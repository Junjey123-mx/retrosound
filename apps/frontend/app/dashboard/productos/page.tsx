'use client';

import { useProductos } from '@/hooks/use-productos';

export default function ProductosPage() {
  const { data: productos, isLoading } = useProductos();

  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando productos…</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Productos</h1>
      <p className="mt-1 text-sm text-muted-foreground">{productos?.length ?? 0} registros</p>
      <ul className="mt-6 space-y-2">
        {productos?.map((p) => (
          <li key={p.id} className="rounded-md border px-4 py-3 text-sm">
            <span className="font-medium">{p.titulo}</span>
            <span className="ml-3 text-muted-foreground">Q{p.precioVenta}</span>
            <span className="ml-3 text-xs text-muted-foreground">SKU: {p.codigoSku}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

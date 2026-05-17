'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Truck, Plus, Eye } from 'lucide-react';
import { useProveedorEntregas } from '@/hooks/use-proveedor-portal';
import type { ProveedorEntrega } from '@/types';
import { RoleGuard } from '@/components/guards/role-guard';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { FormModal } from '@/components/ui/form-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants/routes';

const ESTADO_TABS = [
  { value: '', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'parcial', label: 'Parciales' },
  { value: 'recibida', label: 'Recibidas' },
  { value: 'cancelada', label: 'Canceladas' },
];

function fmtFecha(raw?: string | null) {
  if (!raw) return '—';
  return String(raw).slice(0, 10);
}

function estadoBadge(estado: string) {
  switch (estado) {
    case 'pendiente': return <Badge variant="warning">{estado}</Badge>;
    case 'parcial':   return <Badge variant="info">{estado}</Badge>;
    case 'recibida':  return <Badge variant="success">{estado}</Badge>;
    case 'cancelada': return <Badge variant="muted">{estado}</Badge>;
    default:          return <Badge variant="outline">{estado}</Badge>;
  }
}

function EntregasContent() {
  const [estado, setEstado]   = useState('');
  const [page, setPage]       = useState(1);
  const [detalle, setDetalle] = useState<ProveedorEntrega | null>(null);

  const { data, isLoading, error } = useProveedorEntregas({ estado, page, limit: 15 });

  const columns = [
    {
      key: 'idCompra',
      header: 'ID',
      render: (e: ProveedorEntrega) => (
        <span className="font-mono text-xs text-muted-foreground">#{e.idCompra}</span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (e: ProveedorEntrega) => (
        <span className="text-sm">{fmtFecha(e.fecha)}</span>
      ),
    },
    {
      key: 'productos',
      header: 'Producto(s)',
      render: (e: ProveedorEntrega) => {
        if (!e.detalles.length) return <span className="text-muted-foreground">—</span>;
        const primero = e.detalles[0];
        return (
          <div>
            <p className="text-sm font-medium text-foreground">{primero.producto.titulo}</p>
            <p className="text-xs text-muted-foreground">SKU: {primero.producto.sku}</p>
            {e.detalles.length > 1 && (
              <p className="text-xs text-muted-foreground">+{e.detalles.length - 1} más</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'cantidadComprada',
      header: 'Cantidad',
      render: (e: ProveedorEntrega) => {
        const total = e.detalles.reduce((acc, d) => acc + d.cantidadComprada, 0);
        return <span className="text-sm">{total || '—'}</span>;
      },
    },
    {
      key: 'costo',
      header: 'Costo total',
      render: (e: ProveedorEntrega) => {
        const total = e.detalles.reduce(
          (acc, d) => acc + d.cantidadComprada * d.costoUnitario,
          0,
        );
        return total > 0
          ? <span className="text-sm">Q{total.toFixed(2)}</span>
          : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (e: ProveedorEntrega) => estadoBadge(e.estado),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (e: ProveedorEntrega) => (
        <Button size="sm" variant="outline" onClick={() => setDetalle(e)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Detalle
        </Button>
      ),
    },
  ];

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Mis entregas"
        description="Consulta el estado de entregas registradas"
        icon={<Truck className="h-5 w-5" />}
        backHref="/proveedor"
        action={
          <Button asChild size="sm">
            <Link href={ROUTES.proveedor.entregasNueva as any}>
              <Plus className="mr-1.5 h-4 w-4" />
              Registrar entrega
            </Link>
          </Button>
        }
      />

      <FilterTabs
        tabs={ESTADO_TABS}
        active={estado}
        onChange={(v) => { setEstado(v); setPage(1); }}
      />

      {isLoading ? (
        <LoadingState variant="table" label="Cargando entregas…" />
      ) : error ? (
        <ErrorState title="Error al cargar entregas" error={error} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title="Sin entregas"
          description={estado ? 'No hay entregas con ese estado.' : 'Aún no has registrado ninguna entrega.'}
          action={
            <Button asChild size="sm">
              <Link href={ROUTES.proveedor.entregasNueva as any}>
                <Plus className="mr-1.5 h-4 w-4" />
                Registrar primera entrega
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.data}
          getRowKey={(e) => e.idCompra}
        />
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {data.meta.page} de {data.meta.totalPages} · {data.meta.total} entregas
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* modal detalle */}
      <FormModal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={`Entrega #${detalle?.idCompra ?? ''}`}
        description={`Fecha: ${fmtFecha(detalle?.fecha)} · Estado: ${detalle?.estado ?? ''}`}
        size="lg"
      >
        {detalle && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Producto</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">SKU</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Costo unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalles.map((d) => (
                    <tr key={d.idDetalle} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{d.producto.titulo}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.producto.sku}</td>
                      <td className="px-4 py-3 text-right">{d.cantidadComprada}</td>
                      <td className="px-4 py-3 text-right">Q{d.costoUnitario.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        Q{(d.cantidadComprada * d.costoUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total entrega</span>
              <span className="font-semibold text-foreground">
                Q{detalle.detalles
                  .reduce((acc, d) => acc + d.cantidadComprada * d.costoUnitario, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </FormModal>
    </main>
  );
}

export default function EntregasProveedorPage() {
  return (
    <RoleGuard allowed={['proveedor']}>
      <EntregasContent />
    </RoleGuard>
  );
}

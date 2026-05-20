'use client';

import { useState } from 'react';
import { Package, Disc3 } from 'lucide-react';
import { useProveedorProductos, useProveedorProducto } from '@/hooks/use-proveedor-portal';
import type { ProveedorProducto } from '@/types';
import { PageHeader }   from '@/components/ui/page-header';
import { Badge }        from '@/components/ui/badge';
import { Button }       from '@/components/ui/button';
import { DataTable }    from '@/components/ui/data-table';
import { SearchInput }  from '@/components/ui/search-input';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { FormModal }    from '@/components/ui/form-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';

// ─── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_TABS = [
  { value: '',              label: 'Todos'          },
  { value: 'activo',        label: 'Activos'        },
  { value: 'agotado',       label: 'Agotados'       },
  { value: 'inactivo',      label: 'Inactivos'      },
  { value: 'descontinuado', label: 'Descontinuados' },
];

function estadoBadge(estado: string) {
  switch (estado) {
    case 'activo':        return <Badge variant="success">{estado}</Badge>;
    case 'agotado':       return <Badge variant="danger">{estado}</Badge>;
    case 'inactivo':      return <Badge variant="muted">{estado}</Badge>;
    case 'descontinuado': return <Badge variant="muted">{estado}</Badge>;
    default:              return <Badge variant="outline">{estado}</Badge>;
  }
}

function formatQ(n: number) {
  return `Q${Number(n).toFixed(2)}`;
}

// ─── miniatura ────────────────────────────────────────────────────────────────

function AlbumThumb({ src, alt, size = 'sm' }: { src: string | null; alt: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-28 w-28' : 'h-10 w-10';
  return (
    <div className={`${dim} shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            (el.nextElementSibling as HTMLElement | null)?.removeAttribute('style');
          }}
        />
      ) : null}
      <Disc3
        className="h-5 w-5 text-muted-foreground"
        style={src ? { display: 'none' } : undefined}
      />
    </div>
  );
}

// ─── modal detalle ────────────────────────────────────────────────────────────

function DetalleModal({ producto, onClose }: { producto: ProveedorProducto; onClose: () => void }) {
  const { data: detalleFull } = useProveedorProducto(producto.idProducto);
  const costoProveedor = detalleFull?.costoUnitarioProveedor ?? producto.costoUnitarioProveedor;
  const descuento = detalleFull?.descuentoActual ?? producto.descuentoActual ?? 0;
  const pFinal = Number(producto.precioVenta) * (1 - descuento / 100);

  return (
    <FormModal
      open
      onClose={onClose}
      title={producto.tituloProducto}
      description={`SKU: ${producto.codigoSku}`}
      size="md"
    >
      <div className="space-y-5">

        {/* imagen centrada */}
        <div className="flex justify-center">
          <AlbumThumb src={producto.imagenUrl} alt={producto.tituloProducto} size="lg" />
        </div>

        {/* grid de datos */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailRow label="SKU"                        value={<span className="font-mono">{producto.codigoSku}</span>} />
          <DetailRow label="Estado"                     value={estadoBadge(producto.estadoProducto)} />
          {costoProveedor !== undefined && (
            <DetailRow label="Costo unitario proveedor" value={formatQ(costoProveedor)} />
          )}
          <DetailRow label="Precio de venta RetroSound" value={formatQ(producto.precioVenta)} />
          {descuento > 0 && (
            <DetailRow label="Descuento actual"         value={`${descuento}%`} />
          )}
          {descuento > 0 && (
            <DetailRow label="Precio final"             value={
              <span className="font-semibold text-brand">{formatQ(pFinal)}</span>
            } />
          )}
          <DetailRow label="Stock actual"               value={
            <span className={producto.stockActual === 0 ? 'font-semibold text-danger' : 'text-foreground'}>
              {producto.stockActual}
            </span>
          } />
          <DetailRow label="Stock mínimo"               value={String(producto.stockMinimo)} />
          {producto.anioLanzamiento && (
            <DetailRow label="Año"                      value={String(producto.anioLanzamiento)} />
          )}
        </div>

        {producto.descripcionProducto && (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</p>
            <p className="text-foreground">{producto.descripcionProducto}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          La edición del catálogo se administra desde el panel de administrador.
        </p>
      </div>
    </FormModal>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 font-medium text-foreground">{value}</div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

function ProductosContent() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage]     = useState(1);
  const [detalle, setDetalle] = useState<ProveedorProducto | null>(null);

  const { data, isLoading, error } = useProveedorProductos({ search, estado, page, limit: 15 });

  const columns = [
    {
      key: 'tituloProducto',
      header: 'Producto',
      render: (p: ProveedorProducto) => (
        <div className="flex items-center gap-3">
          <AlbumThumb src={p.imagenUrl} alt={p.tituloProducto} />
          <div>
            <p className="font-medium text-foreground">{p.tituloProducto}</p>
            {p.descripcionProducto && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.descripcionProducto}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'codigoSku',
      header: 'SKU',
      render: (p: ProveedorProducto) => (
        <span className="font-mono text-xs text-muted-foreground">{p.codigoSku}</span>
      ),
    },
    {
      key: 'stockActual',
      header: 'Stock',
      render: (p: ProveedorProducto) => (
        <span className={p.stockActual === 0 ? 'font-semibold text-danger' : 'text-foreground'}>
          {p.stockActual}
        </span>
      ),
    },
    {
      key: 'estadoProducto',
      header: 'Estado',
      render: (p: ProveedorProducto) => estadoBadge(p.estadoProducto),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (p: ProveedorProducto) => (
        <Button size="sm" variant="outline" onClick={() => setDetalle(p)}>
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Mis productos"
        description="Consulta el catálogo de productos asociados a tu cuenta"
        icon={<Package className="h-5 w-5" />}
        backHref="/proveedor"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Buscar por título o SKU…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={() => { setSearch(''); setPage(1); }}
          containerClassName="flex-1"
        />
        <FilterTabs
          tabs={ESTADO_TABS}
          active={estado}
          onChange={(v) => { setEstado(v); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <LoadingState variant="table" label="Cargando productos…" />
      ) : error ? (
        <ErrorState title="Error al cargar productos" error={error} />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Sin productos"
          description={search || estado ? 'No hay resultados con los filtros aplicados.' : 'No tienes productos asociados.'}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.data}
          getRowKey={(p) => p.idProducto}
        />
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {data.meta.page} de {data.meta.totalPages} · {data.meta.total} productos
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {detalle && <DetalleModal producto={detalle} onClose={() => setDetalle(null)} />}
    </main>
  );
}

export function ProviderProductsPage() {
  return <ProductosContent />;
}

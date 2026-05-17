import { useState } from 'react';
import { Package, ImageIcon } from 'lucide-react';
import {
  useProveedorProductos,
  useUpdateProveedorProducto,
  useUpdateProveedorProductoImagen,
} from '@/hooks/use-proveedor-portal';
import type { ProveedorProducto } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { FormModal } from '@/components/ui/form-modal';
import { NotifyModal } from '@/components/ui/notify-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ESTADO_TABS = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'agotado', label: 'Agotados' },
  { value: 'inactivo', label: 'Inactivos' },
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

function ProductosContent() {
  const [search, setSearch]     = useState('');
  const [estado, setEstado]     = useState('');
  const [page, setPage]         = useState(1);

  const [editTarget, setEditTarget]       = useState<ProveedorProducto | null>(null);
  const [imagenTarget, setImagenTarget]   = useState<ProveedorProducto | null>(null);
  const [descripcion, setDescripcion]     = useState('');
  const [imagenUrl, setImagenUrl]         = useState('');
  const [imagenPublicId, setImagenPublicId] = useState('');

  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const { data, isLoading, error } = useProveedorProductos({ search, estado, page, limit: 15 });
  const updateProducto = useUpdateProveedorProducto();
  const updateImagen   = useUpdateProveedorProductoImagen();

  function openEdit(p: ProveedorProducto) {
    setEditTarget(p);
    setDescripcion(p.descripcionProducto ?? '');
  }

  function openImagen(p: ProveedorProducto) {
    setImagenTarget(p);
    setImagenUrl(p.imagenUrl ?? '');
    setImagenPublicId('');
  }

  function handleEdit() {
    if (!editTarget) return;
    updateProducto.mutate(
      { id: editTarget.idProducto, dto: { descripcion } },
      {
        onSuccess: () => {
          setEditTarget(null);
          setNotify({ type: 'success', title: 'Actualizado', message: 'Descripción actualizada correctamente.' });
        },
        onError: (err) => {
          setNotify({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Error al actualizar.' });
        },
      },
    );
  }

  function handleImagen() {
    if (!imagenTarget) return;
    if (!imagenUrl.trim() || !imagenPublicId.trim()) {
      setNotify({ type: 'error', title: 'Campos requeridos', message: 'La URL y el ID público son obligatorios.' });
      return;
    }
    updateImagen.mutate(
      { id: imagenTarget.idProducto, dto: { imagenUrl: imagenUrl.trim(), imagenPublicId: imagenPublicId.trim() } },
      {
        onSuccess: () => {
          setImagenTarget(null);
          setNotify({ type: 'success', title: 'Imagen actualizada', message: 'La imagen del producto fue actualizada.' });
        },
        onError: (err) => {
          setNotify({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Error al actualizar imagen.' });
        },
      },
    );
  }

  const columns = [
    {
      key: 'tituloProducto',
      header: 'Producto',
      render: (p: ProveedorProducto) => (
        <div>
          <p className="font-medium text-foreground">{p.tituloProducto}</p>
          {p.descripcionProducto && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.descripcionProducto}</p>
          )}
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
        <span className={p.stockActual === 0 ? 'text-danger font-semibold' : 'text-foreground'}>
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
      key: 'imagenUrl',
      header: 'Imagen',
      render: (p: ProveedorProducto) =>
        p.imagenUrl ? (
          <a
            href={p.imagenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:underline"
          >
            Ver
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (p: ProveedorProducto) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
            Editar
          </Button>
          <Button size="sm" variant="outline" onClick={() => openImagen(p)}>
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Mis productos"
        description="Consulta y actualiza la información permitida de tus productos"
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

      {/* modal editar descripción */}
      <FormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Editar producto"
        description={editTarget?.tituloProducto}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              loading={updateProducto.isPending}
              disabled={updateProducto.isPending}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            id="descripcion"
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            placeholder="Describe el producto…"
          />
          <p className="text-xs text-muted-foreground">
            Solo puedes editar la descripción del producto.
          </p>
        </div>
      </FormModal>

      {/* modal actualizar imagen */}
      <FormModal
        open={!!imagenTarget}
        onClose={() => setImagenTarget(null)}
        title="Actualizar imagen"
        description={imagenTarget?.tituloProducto}
        footer={
          <>
            <Button variant="outline" onClick={() => setImagenTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleImagen}
              loading={updateImagen.isPending}
              disabled={updateImagen.isPending}
            >
              Guardar imagen
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            id="imagenUrl"
            label="URL de imagen *"
            type="url"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            placeholder="https://…"
          />
          <Input
            id="imagenPublicId"
            label="ID público de imagen *"
            value={imagenPublicId}
            onChange={(e) => setImagenPublicId(e.target.value)}
            placeholder="carpeta/nombre-imagen"
          />
        </div>
      </FormModal>

      {notify && (
        <NotifyModal
          type={notify.type}
          title={notify.title}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}
    </main>
  );
}

export function ProviderProductsPage() {
  return <ProductosContent />;
}

'use client';

import { useState, useMemo, useRef } from 'react';
import {
  useProductos,
  useProducto,
  useCreateProducto,
  useUpdateProducto,
  useUpdateProductoImagen,
  useDeactivateProducto,
} from '@/hooks/use-productos';
import { useCatalogos } from '@/hooks/use-catalogs';
import type { Producto } from '@/types';
import { Pencil, PowerOff, Package, ImagePlus, X, Eye } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-auth';
import { PageHeader }    from '@/components/ui/page-header';
import { DataTable }     from '@/components/ui/data-table';
import { Badge }         from '@/components/ui/badge';
import { Button }        from '@/components/ui/button';
import { SearchInput }   from '@/components/ui/search-input';
import { FilterTabs }    from '@/components/ui/filter-tabs';
import { FormModal }     from '@/components/ui/form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoleGuard }     from '@/components/guards/role-guard';
import { NotifyModal }   from '@/components/ui/notify-modal';
import { LoadingState }  from '@/components/ui/loading-state';
import { ErrorState }    from '@/components/ui/error-state';
import { EmptyState }    from '@/components/ui/empty-state';

// ─── cloudinary ───────────────────────────────────────────────────────────────

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary no está configurado (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).');
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  const data = await res.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Error Cloudinary (${res.status})`);
  }
  return { url: data.secure_url!, publicId: data.public_id! };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function estadoBadgeVariant(estado: string) {
  if (estado === 'activo')        return 'success'  as const;
  if (estado === 'inactivo')      return 'muted'    as const;
  if (estado === 'agotado')       return 'warning'  as const;
  if (estado === 'descontinuado') return 'danger'   as const;
  return 'muted' as const;
}

function formatQ(value: number | string) {
  return `Q${Number(value).toFixed(2)}`;
}

// ─── form ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  titulo:          '',
  descripcion:     '',
  anioLanzamiento: '',
  precioVenta:     '',
  descuentoActual: '0',
  stockMinimo:     '',
  idCategoria:     '',
  idFormato:       '',
};

type FormState = typeof EMPTY_FORM;

function precioFinal(precio: string, descuento: string): number {
  const p = Number(precio);
  const d = Number(descuento);
  if (isNaN(p) || isNaN(d)) return p;
  return p * (1 - d / 100);
}

function validate(f: FormState, costoProveedor?: number): string | null {
  if (!f.titulo.trim()) return 'El título es obligatorio.';
  if (f.precioVenta === '' || isNaN(Number(f.precioVenta)) || Number(f.precioVenta) < 0)
    return 'El precio de venta debe ser un número mayor o igual a 0.';
  const desc = Number(f.descuentoActual);
  if (isNaN(desc) || desc < 0 || desc > 100)
    return 'El descuento debe estar entre 0 y 100.';
  if (costoProveedor !== undefined) {
    const pf = precioFinal(f.precioVenta, f.descuentoActual);
    if (pf < costoProveedor)
      return `El precio final con descuento (Q${pf.toFixed(2)}) no puede ser menor al costo del proveedor (Q${costoProveedor.toFixed(2)}).`;
  }
  if (f.stockMinimo === '' || isNaN(Number(f.stockMinimo)) || Number(f.stockMinimo) < 0)
    return 'El stock mínimo debe ser un número mayor o igual a 0.';
  if (!f.idCategoria) return 'Selecciona una categoría.';
  if (!f.idFormato)   return 'Selecciona un formato.';
  return null;
}

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

// ─── page ─────────────────────────────────────────────────────────────────────

function ProductosContent() {
  const currentUser = useCurrentUser();
  const isAdmin     = currentUser?.rol === 'admin';

  const { data: productos, isLoading, error: loadError } = useProductos();
  const { data: catalogos } = useCatalogos();
  const createMut    = useCreateProducto();
  const updateMut    = useUpdateProducto();
  const updateImgMut = useUpdateProductoImagen();
  const deactMut     = useDeactivateProducto();

  const [search,      setSearch]      = useState('');
  const [filterTab,   setFilterTab]   = useState('todos');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState<Producto | null>(null);
  const [viewing,     setViewing]     = useState<Producto | null>(null);

  const { data: editingDetalle } = useProducto(editing?.id ?? 0);
  const costoProveedor = editingDetalle?.costoUnitarioProveedor;
  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [formError,   setFormError]   = useState<string | null>(null);
  const [confirmId,   setConfirmId]   = useState<number | null>(null);
  const [notify,      setNotify]      = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [recentIds,   setRecentIds]   = useState<number[]>([]);
  const [imgFile,     setImgFile]     = useState<File | null>(null);
  const [imgPreview,  setImgPreview]  = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError,    setImgError]    = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const confirmTarget = productos?.find((p) => p.id === confirmId) ?? null;

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      titulo:          p.titulo,
      descripcion:     p.descripcion ?? '',
      anioLanzamiento: p.anioLanzamiento?.toString() ?? '',
      precioVenta:     String(p.precioVenta),
      descuentoActual: String(p.descuentoActual ?? 0),
      stockMinimo:     String(p.stockMinimo),
      idCategoria:     String(p.idCategoria),
      idFormato:       String(p.idFormato),
    });
    setImgFile(null);
    setImgPreview(null);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setImgFile(null);
    setImgPreview(null);
    setImgError(null);
  }

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  }

  function clearImg() {
    setImgFile(null);
    setImgPreview(null);
    setImgError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUploadImage() {
    if (!imgFile || !editing) return;
    setImgUploading(true);
    setImgError(null);
    try {
      const { url, publicId } = await uploadToCloudinary(imgFile);
      await updateImgMut.mutateAsync({ id: editing.id, imagenUrl: url, imagenPublicId: publicId });
      setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
      setEditing((prev) => prev ? { ...prev, imagenUrl: url } : prev);
      setImgFile(null);
      setImgPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setNotify({ type: 'success', title: 'Imagen actualizada', message: 'La imagen del producto se guardó correctamente.' });
    } catch (err: unknown) {
      setImgError((err as Error).message ?? 'Error al subir la imagen.');
    } finally {
      setImgUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate(form, costoProveedor);
    if (err) { setFormError(err); return; }
    setFormError(null);

    const payload: Partial<Producto> = {
      titulo:          form.titulo.trim(),
      descripcion:     form.descripcion.trim() || undefined,
      anioLanzamiento: form.anioLanzamiento ? Number(form.anioLanzamiento) : undefined,
      precioVenta:     Number(form.precioVenta),
      descuentoActual: Number(form.descuentoActual),
      stockMinimo:     Number(form.stockMinimo),
      idCategoria:     Number(form.idCategoria),
      idFormato:       Number(form.idFormato),
    };

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload });
        setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
        closeModal();
        setNotify({ type: 'success', title: 'Producto actualizado', message: 'Los cambios se guardaron correctamente.' });
      } else {
        const created = await createMut.mutateAsync(payload);
        if (created?.id) setRecentIds((prev) => [created.id, ...prev]);
        closeModal();
        setNotify({ type: 'success', title: 'Producto añadido', message: 'El producto se registró correctamente.' });
      }
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el producto.');
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmTarget) return;
    try {
      await deactMut.mutateAsync(confirmTarget.id);
      setRecentIds((prev) => [confirmTarget.id, ...prev.filter((x) => x !== confirmTarget.id)]);
      setConfirmId(null);
      setNotify({ type: 'success', title: 'Producto desactivado', message: `"${confirmTarget.titulo}" pasó a estado descontinuado.` });
    } catch (err: unknown) {
      setConfirmId(null);
      setNotify({ type: 'error', title: 'Error al desactivar', message: (err as Error).message ?? 'No se pudo completar la operación.' });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;
  const isImgBusy = imgUploading || updateImgMut.isPending;

  const sorted = useMemo(() => {
    return [...(productos ?? [])].sort((a, b) => {
      const ai = recentIds.indexOf(a.id);
      const bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [productos, recentIds]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTab !== 'todos') list = list.filter((p) => p.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.codigoSku.toLowerCase().includes(q) ||
          (p.categoria?.nombre ?? '').toLowerCase().includes(q) ||
          (p.formato?.nombre ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filterTab, search]);

  const tabCounts = useMemo(() => {
    const all = productos ?? [];
    return {
      todos:         all.length,
      activo:        all.filter((p) => p.estado === 'activo').length,
      agotado:       all.filter((p) => p.estado === 'agotado').length,
      descontinuado: all.filter((p) => p.estado === 'descontinuado').length,
    };
  }, [productos]);

  const columns = [
    {
      key: 'codigoSku',
      header: 'SKU',
      render: (p: Producto) => (
        <span className="font-mono text-xs text-muted-foreground">{p.codigoSku}</span>
      ),
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (p: Producto) => (
        <span className="font-medium text-foreground">{p.titulo}</span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (p: Producto) => (
        <span className="text-muted-foreground">{p.categoria?.nombre ?? '—'}</span>
      ),
    },
    {
      key: 'formato',
      header: 'Formato',
      render: (p: Producto) => (
        <span className="text-muted-foreground">{p.formato?.nombre ?? '—'}</span>
      ),
    },
    {
      key: 'precioVenta',
      header: 'Precio venta',
      className: 'text-right',
      render: (p: Producto) => (
        <span className="font-medium tabular-nums text-foreground">{formatQ(p.precioVenta)}</span>
      ),
    },
    {
      key: 'descuentoActual',
      header: 'Descuento',
      className: 'text-center',
      render: (p: Producto) => {
        const d = p.descuentoActual ?? 0;
        return d > 0
          ? <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{d}%</span>
          : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: 'precioFinal',
      header: 'Precio final',
      className: 'text-right',
      render: (p: Producto) => {
        const d = p.descuentoActual ?? 0;
        const pf = Number(p.precioVenta) * (1 - d / 100);
        return d > 0
          ? <span className="font-semibold tabular-nums text-brand">{formatQ(pf)}</span>
          : <span className="tabular-nums text-muted-foreground">—</span>;
      },
    },
    {
      key: 'stockActual',
      header: 'Stock',
      className: 'text-right',
      render: (p: Producto) => {
        const low = p.stockActual <= p.stockMinimo && p.stockActual > 0;
        const out = p.stockActual === 0;
        return (
          <span className={`font-medium tabular-nums ${out ? 'text-danger' : low ? 'text-warning' : 'text-foreground'}`}>
            {p.stockActual}
            {low && !out && <span className="ml-1 text-xs text-warning">↓</span>}
          </span>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (p: Producto) => (
        <Badge variant={estadoBadgeVariant(p.estado)}>
          {p.estado}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (p: Producto) =>
        isAdmin ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEdit(p)}
              className="gap-1.5 text-xs"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </Button>
            {p.estado !== 'descontinuado' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmId(p.id)}
                disabled={deactMut.isPending}
                className="gap-1.5 text-xs"
              >
                <PowerOff className="h-3 w-3" />
                Desactivar
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewing(p)}
            className="gap-1.5 text-xs"
          >
            <Eye className="h-3 w-3" />
            Ver detalle
          </Button>
        ),
    },
  ];

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando productos…" /></div>;
  if (loadError)  return <div className="p-8"><ErrorState title="Error al cargar productos" error={loadError} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Productos"
        description="Administra el catálogo de RetroSound"
        icon={<Package className="h-5 w-5" />}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={[
            { value: 'todos',         label: 'Todos',         count: tabCounts.todos         },
            { value: 'activo',        label: 'Activos',       count: tabCounts.activo        },
            { value: 'agotado',       label: 'Agotados',      count: tabCounts.agotado       },
            { value: 'descontinuado', label: 'Descontinuados', count: tabCounts.descontinuado },
          ]}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por título, categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            containerClassName="w-64"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'No hay productos'}
          description={
            search || filterTab !== 'todos'
              ? 'Intenta ajustar la búsqueda o los filtros.'
              : 'El catálogo de productos está vacío.'
          }
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered}
          getRowKey={(p) => (p as Producto).id}
        />
      )}

      {/* Notify */}
      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      {/* ConfirmDialog */}
      <ConfirmDialog
        open={!!confirmId}
        title="¿Desactivar producto?"
        description={confirmTarget ? `"${confirmTarget.titulo}" pasará a estado descontinuado.` : undefined}
        confirmLabel="Desactivar"
        variant="danger"
        loading={deactMut.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmId(null)}
      />

      {/* Modal solo lectura — empleado_inventario */}
      {viewing && (
        <FormModal
          open
          onClose={() => setViewing(null)}
          title={viewing.titulo}
          description={`SKU: ${viewing.codigoSku}`}
          size="md"
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'SKU',         value: <span className="font-mono">{viewing.codigoSku}</span> },
              { label: 'Estado',      value: <Badge variant={estadoBadgeVariant(viewing.estado)}>{viewing.estado}</Badge> },
              { label: 'Categoría',   value: viewing.categoria?.nombre ?? '—' },
              { label: 'Formato',     value: viewing.formato?.nombre ?? '—' },
              { label: 'Precio venta', value: formatQ(viewing.precioVenta) },
              { label: 'Descuento',   value: (viewing.descuentoActual ?? 0) > 0 ? `${viewing.descuentoActual}%` : '—' },
              { label: 'Precio final', value: (() => { const d = viewing.descuentoActual ?? 0; return d > 0 ? <span className="font-semibold text-brand">{formatQ(Number(viewing.precioVenta) * (1 - d / 100))}</span> : <span className="text-muted-foreground">—</span>; })() },
              { label: 'Stock actual', value: <span className={viewing.stockActual === 0 ? 'font-semibold text-danger' : 'text-foreground'}>{viewing.stockActual}</span> },
              { label: 'Stock mínimo', value: String(viewing.stockMinimo) },
              ...(viewing.anioLanzamiento ? [{ label: 'Año', value: String(viewing.anioLanzamiento) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-card px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="mt-0.5 font-medium text-foreground">{value}</div>
              </div>
            ))}
          </div>
          {viewing.descripcion && (
            <div className="mt-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</p>
              <p className="text-foreground">{viewing.descripcion}</p>
            </div>
          )}
          {viewing.imagenUrl && (
            <div className="mt-3 flex justify-center">
              <img
                src={viewing.imagenUrl}
                alt={viewing.titulo}
                className="h-28 w-28 rounded-lg border border-border object-cover"
              />
            </div>
          )}
        </FormModal>
      )}

      {/* Modal crear/editar */}
      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description={editing ? `Editando: ${editing.titulo}` : 'Completa los datos del nuevo producto.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              form="producto-form"
              type="submit"
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="producto-form" onSubmit={handleSubmit} className="space-y-4">

          {formError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Título <span className="text-danger">*</span>
            </label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ej: The Dark Side of the Moon"
              className={FIELD}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Año de lanzamiento</label>
            <input
              name="anioLanzamiento"
              type="number"
              min="1900"
              max="2099"
              value={form.anioLanzamiento}
              onChange={handleChange}
              placeholder="Ej: 1973"
              className={FIELD}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Precio de venta RetroSound (Q) <span className="text-danger">*</span>
              </label>
              <input
                name="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={form.precioVenta}
                onChange={handleChange}
                placeholder="0.00"
                className={FIELD}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Stock mínimo <span className="text-danger">*</span>
              </label>
              <input
                name="stockMinimo"
                type="number"
                min="0"
                value={form.stockMinimo}
                onChange={handleChange}
                placeholder="0"
                className={FIELD}
              />
            </div>
          </div>

          {/* Descuento y precio final */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Descuento actual (%)
              </label>
              <input
                name="descuentoActual"
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.descuentoActual}
                onChange={handleChange}
                placeholder="0"
                className={FIELD}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Precio final con descuento (Q)
              </label>
              <input
                type="text"
                value={
                  form.precioVenta !== ''
                    ? `Q${precioFinal(form.precioVenta, form.descuentoActual).toFixed(2)}`
                    : '—'
                }
                readOnly
                disabled
                className={FIELD}
              />
            </div>
          </div>

          {editing && costoProveedor !== undefined && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Costo unitario proveedor (Q)
              </label>
              <input
                type="text"
                value={`Q${costoProveedor.toFixed(2)}`}
                readOnly
                disabled
                className={FIELD}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Categoría <span className="text-danger">*</span>
              </label>
              <select name="idCategoria" value={form.idCategoria} onChange={handleChange} className={FIELD}>
                <option value="">Seleccionar…</option>
                {catalogos?.categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Formato <span className="text-danger">*</span>
              </label>
              <select name="idFormato" value={form.idFormato} onChange={handleChange} className={FIELD}>
                <option value="">Seleccionar…</option>
                {catalogos?.formatos.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción opcional del producto…"
              className={FIELD}
            />
          </div>

          {/* Sección imagen — solo al editar */}
          {editing && (
            <div className="space-y-2 rounded-xl border border-border bg-surface-alt p-3">
              <label className="block text-sm font-medium text-foreground">
                Imagen del producto
              </label>

              {/* Preview: nueva seleccionada o actual */}
              {(imgPreview || editing.imagenUrl) && (
                <div className="relative w-fit">
                  <img
                    src={imgPreview ?? editing.imagenUrl!}
                    alt="Imagen del producto"
                    className="h-28 w-28 rounded-lg border border-border object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  {imgPreview && (
                    <button
                      type="button"
                      onClick={clearImg}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImgChange}
                  className="hidden"
                  id="img-upload-input"
                />
                <label
                  htmlFor="img-upload-input"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt transition"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {editing.imagenUrl && !imgFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </label>

                {imgFile && (
                  <Button
                    type="button"
                    size="sm"
                    loading={isImgBusy}
                    disabled={isImgBusy}
                    onClick={handleUploadImage}
                    className="text-xs"
                  >
                    {isImgBusy ? 'Subiendo…' : 'Subir imagen'}
                  </Button>
                )}
              </div>

              {imgFile && !isImgBusy && (
                <p className="text-xs text-muted-foreground">{imgFile.name}</p>
              )}

              {imgError && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                  {imgError}
                </p>
              )}
            </div>
          )}

        </form>
      </FormModal>

    </main>
  );
}

export function ProductsPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <ProductosContent />
    </RoleGuard>
  );
}

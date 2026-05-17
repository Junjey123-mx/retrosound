'use client';

import { useState, useMemo } from 'react';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeactivateProducto,
} from '@/hooks/use-productos';
import { useCatalogos } from '@/hooks/use-catalogs';
import type { Producto } from '@/types';
import { Pencil, PowerOff, Package } from 'lucide-react';
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
  stockActual:     '',
  stockMinimo:     '',
  codigoSku:       '',
  idCategoria:     '',
  idFormato:       '',
};

type FormState = typeof EMPTY_FORM;

function validate(f: FormState): string | null {
  if (!f.titulo.trim())    return 'El título es obligatorio.';
  if (!f.codigoSku.trim()) return 'El SKU es obligatorio.';
  if (f.precioVenta === '' || isNaN(Number(f.precioVenta)) || Number(f.precioVenta) < 0)
    return 'El precio debe ser un número mayor o igual a 0.';
  if (f.stockActual === '' || isNaN(Number(f.stockActual)) || Number(f.stockActual) < 0)
    return 'El stock actual debe ser un número mayor o igual a 0.';
  if (f.stockMinimo === '' || isNaN(Number(f.stockMinimo)) || Number(f.stockMinimo) < 0)
    return 'El stock mínimo debe ser un número mayor o igual a 0.';
  if (!f.idCategoria) return 'Selecciona una categoría.';
  if (!f.idFormato)   return 'Selecciona un formato.';
  return null;
}

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

// ─── page ─────────────────────────────────────────────────────────────────────

function ProductosContent() {
  const { data: productos, isLoading, error: loadError } = useProductos();
  const { data: catalogos } = useCatalogos();
  const createMut = useCreateProducto();
  const updateMut = useUpdateProducto();
  const deactMut  = useDeactivateProducto();

  const [search,     setSearch]     = useState('');
  const [filterTab,  setFilterTab]  = useState('todos');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Producto | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [confirmId,  setConfirmId]  = useState<number | null>(null);
  const [notify,     setNotify]     = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [recentIds,  setRecentIds]  = useState<number[]>([]);

  const confirmTarget = productos?.find((p) => p.id === confirmId) ?? null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      titulo:          p.titulo,
      descripcion:     p.descripcion ?? '',
      anioLanzamiento: p.anioLanzamiento?.toString() ?? '',
      precioVenta:     String(p.precioVenta),
      stockActual:     String(p.stockActual),
      stockMinimo:     String(p.stockMinimo),
      codigoSku:       p.codigoSku,
      idCategoria:     String(p.idCategoria),
      idFormato:       String(p.idFormato),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }
    setFormError(null);

    const payload: Partial<Producto> = {
      titulo:          form.titulo.trim(),
      descripcion:     form.descripcion.trim() || undefined,
      anioLanzamiento: form.anioLanzamiento ? Number(form.anioLanzamiento) : undefined,
      precioVenta:     Number(form.precioVenta),
      stockActual:     Number(form.stockActual),
      stockMinimo:     Number(form.stockMinimo),
      codigoSku:       form.codigoSku.trim(),
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
      header: 'Precio',
      className: 'text-right',
      render: (p: Producto) => (
        <span className="font-medium tabular-nums text-foreground">{formatQ(p.precioVenta)}</span>
      ),
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
      render: (p: Producto) => (
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
        action={
          <Button onClick={openCreate} size="sm">
            + Nuevo producto
          </Button>
        }
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
            placeholder="Buscar por SKU, título, categoría…"
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
              : 'Agrega el primer producto al catálogo.'
          }
          action={
            !search && filterTab === 'todos' ? (
              <Button size="sm" onClick={openCreate}>+ Nuevo producto</Button>
            ) : undefined
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                SKU <span className="text-danger">*</span>
              </label>
              <input
                name="codigoSku"
                value={form.codigoSku}
                onChange={handleChange}
                placeholder="Ej: RS-001-V"
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Precio (Q) <span className="text-danger">*</span>
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
                Stock actual <span className="text-danger">*</span>
              </label>
              <input
                name="stockActual"
                type="number"
                min="0"
                value={form.stockActual}
                onChange={handleChange}
                placeholder="0"
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

        </form>
      </FormModal>

    </main>
  );
}

export default function ProductosPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <ProductosContent />
    </RoleGuard>
  );
}

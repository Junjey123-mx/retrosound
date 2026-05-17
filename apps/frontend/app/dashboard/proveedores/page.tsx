'use client';

import { useState, useMemo } from 'react';
import {
  useProveedores,
  useCreateProveedor,
  useUpdateProveedor,
  useDeactivateProveedor,
} from '@/hooks/use-proveedores';
import type { Proveedor } from '@/types';
import { Pencil, PowerOff, Truck } from 'lucide-react';
import { PageHeader }    from '@/components/ui/page-header';
import { DataTable }     from '@/components/ui/data-table';
import { Badge }         from '@/components/ui/badge';
import { Button }        from '@/components/ui/button';
import { SearchInput }   from '@/components/ui/search-input';
import { FilterTabs }    from '@/components/ui/filter-tabs';
import { FormModal }     from '@/components/ui/form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NotifyModal }   from '@/components/ui/notify-modal';
import { RoleGuard }     from '@/components/guards/role-guard';
import { LoadingState }  from '@/components/ui/loading-state';
import { ErrorState }    from '@/components/ui/error-state';
import { EmptyState }    from '@/components/ui/empty-state';

// ─── form ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  nombre:         '',
  correo:         '',
  telefono:       '',
  direccion:      '',
  nombreContacto: '',
};

type FormState = typeof EMPTY_FORM;

function validate(f: FormState): string | null {
  if (!f.nombre.trim()) return 'El nombre del proveedor es obligatorio.';
  if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo))
    return 'El correo no tiene un formato válido.';
  return null;
}

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

// ─── page ─────────────────────────────────────────────────────────────────────

function ProveedoresContent() {
  const { data: proveedores, isLoading, error: loadError } = useProveedores();
  const createMut = useCreateProveedor();
  const updateMut = useUpdateProveedor();
  const deactMut  = useDeactivateProveedor();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Proveedor | null>(null);
  const [form,      setForm]      = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [notify,    setNotify]    = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [recentIds, setRecentIds] = useState<number[]>([]);

  const confirmTarget = proveedores?.find((p) => p.id === confirmId) ?? null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(p: Proveedor) {
    setEditing(p);
    setForm({
      nombre:         p.nombre,
      correo:         p.correo         ?? '',
      telefono:       p.telefono       ?? '',
      direccion:      p.direccion      ?? '',
      nombreContacto: p.nombreContacto ?? '',
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }
    setFormError(null);

    const payload: Partial<Proveedor> = {
      nombre:         form.nombre.trim(),
      correo:         form.correo.trim()         || undefined,
      telefono:       form.telefono.trim()       || undefined,
      direccion:      form.direccion.trim()      || undefined,
      nombreContacto: form.nombreContacto.trim() || undefined,
    };

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload });
        setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
        closeModal();
        setNotify({ type: 'success', title: 'Proveedor actualizado', message: 'Los cambios se guardaron correctamente.' });
      } else {
        const created = await createMut.mutateAsync(payload);
        if (created?.id) setRecentIds((prev) => [created.id, ...prev]);
        closeModal();
        setNotify({ type: 'success', title: 'Proveedor creado', message: 'El proveedor se registró correctamente.' });
      }
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el proveedor.');
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmTarget) return;
    try {
      await deactMut.mutateAsync(confirmTarget.id);
      setRecentIds((prev) => [confirmTarget.id, ...prev.filter((x) => x !== confirmTarget.id)]);
      setConfirmId(null);
      setNotify({ type: 'success', title: 'Proveedor desactivado', message: `"${confirmTarget.nombre}" pasó a estado inactivo.` });
    } catch (err: unknown) {
      setConfirmId(null);
      setNotify({ type: 'error', title: 'Error al desactivar', message: (err as Error).message ?? 'No se pudo completar la operación.' });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  const sorted = useMemo(() => {
    return [...(proveedores ?? [])].sort((a, b) => {
      const ai = recentIds.indexOf(a.id);
      const bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [proveedores, recentIds]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTab !== 'todos') list = list.filter((p) => p.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.nombreContacto ?? '').toLowerCase().includes(q) ||
          (p.correo ?? '').toLowerCase().includes(q) ||
          (p.telefono ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filterTab, search]);

  const tabCounts = useMemo(() => {
    const all = proveedores ?? [];
    return {
      todos:    all.length,
      activo:   all.filter((p) => p.estado === 'activo').length,
      inactivo: all.filter((p) => p.estado === 'inactivo').length,
    };
  }, [proveedores]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (p: Proveedor) => (
        <span className="font-medium text-foreground">{p.nombre}</span>
      ),
    },
    {
      key: 'nombreContacto',
      header: 'Contacto',
      render: (p: Proveedor) => (
        <span className="text-muted-foreground">{p.nombreContacto ?? '—'}</span>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (p: Proveedor) => (
        <span className="text-muted-foreground">{p.correo ?? '—'}</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (p: Proveedor) => (
        <span className="text-muted-foreground">{p.telefono ?? '—'}</span>
      ),
    },
    {
      key: 'direccion',
      header: 'Dirección',
      render: (p: Proveedor) => (
        <span className="max-w-50 truncate text-muted-foreground" title={p.direccion ?? ''}>
          {p.direccion ?? '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (p: Proveedor) => (
        <Badge variant={p.estado === 'activo' ? 'success' : 'muted'}>
          {p.estado}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (p: Proveedor) => (
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
          {p.estado === 'activo' && (
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

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando proveedores…" /></div>;
  if (loadError)  return <div className="p-8"><ErrorState title="Error al cargar proveedores" error={loadError} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Proveedores"
        description="Gestiona proveedores y contactos comerciales"
        icon={<Truck className="h-5 w-5" />}
        action={
          <Button onClick={openCreate} size="sm">
            + Nuevo proveedor
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={[
            { value: 'todos',    label: 'Todos',    count: tabCounts.todos    },
            { value: 'activo',   label: 'Activos',  count: tabCounts.activo   },
            { value: 'inactivo', label: 'Inactivos', count: tabCounts.inactivo },
          ]}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por nombre, contacto, correo…"
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
          icon={<Truck className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'No hay proveedores'}
          description={
            search || filterTab !== 'todos'
              ? 'Intenta ajustar la búsqueda o los filtros.'
              : 'Agrega el primer proveedor al sistema.'
          }
          action={
            !search && filterTab === 'todos' ? (
              <Button size="sm" onClick={openCreate}>+ Nuevo proveedor</Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered}
          getRowKey={(p) => (p as Proveedor).id}
        />
      )}

      {/* Notify */}
      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      {/* ConfirmDialog */}
      <ConfirmDialog
        open={!!confirmId}
        title="¿Desactivar proveedor?"
        description={confirmTarget ? `"${confirmTarget.nombre}" pasará a estado inactivo.` : undefined}
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
        title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
        description={editing ? `Editando: ${editing.nombre}` : 'Completa los datos del nuevo proveedor.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              form="proveedor-form"
              type="submit"
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="proveedor-form" onSubmit={handleSubmit} className="space-y-4">

          {formError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Distribuidora Musical S.A."
              className={FIELD}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nombre de contacto</label>
            <input
              name="nombreContacto"
              value={form.nombreContacto}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className={FIELD}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Correo</label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="proveedor@email.com"
                className={FIELD}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 5555-1234"
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Dirección</label>
            <textarea
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              rows={2}
              placeholder="Ej: 6a Av. 1-22, Zona 1, Ciudad de Guatemala"
              className={FIELD}
            />
          </div>

        </form>
      </FormModal>

    </main>
  );
}

export default function ProveedoresPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <ProveedoresContent />
    </RoleGuard>
  );
}

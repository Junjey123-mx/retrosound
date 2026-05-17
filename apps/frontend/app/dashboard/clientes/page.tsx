'use client';

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeactivateCliente,
} from '@/hooks/use-clientes';
import type { Cliente } from '@/types';
import { RoleGuard }    from '@/components/guards/role-guard';
import { PageHeader }   from '@/components/ui/page-header';
import { DataTable }    from '@/components/ui/data-table';
import { Badge }        from '@/components/ui/badge';
import { Button }       from '@/components/ui/button';
import { SearchInput }  from '@/components/ui/search-input';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { FormModal }    from '@/components/ui/form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NotifyModal }  from '@/components/ui/notify-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';
import { Pencil, Trash2 } from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

const EMPTY_FORM = {
  nombre:    '',
  apellido:  '',
  correo:    '',
  telefono:  '',
  direccion: '',
};
type FormState = typeof EMPTY_FORM;

function validate(f: FormState): string | null {
  if (!f.nombre.trim())   return 'El nombre es obligatorio.';
  if (!f.apellido.trim()) return 'El apellido es obligatorio.';
  if (!f.correo.trim())   return 'El correo es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) return 'El correo no tiene un formato válido.';
  return null;
}

function fmtFecha(raw?: string) {
  return raw ? String(raw).slice(0, 10) : '—';
}

// ─── page ─────────────────────────────────────────────────────────────────────

function ClientesContent() {
  const { data: clientes, isLoading, error } = useClientes();
  const createMut = useCreateCliente();
  const updateMut = useUpdateCliente();
  const deactMut  = useDeactivateCliente();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<Cliente | null>(null);
  const [form,      setForm]      = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [notify,    setNotify]    = useState<{ type: 'success'|'error'; title: string; message: string } | null>(null);
  const [recentIds, setRecentIds] = useState<number[]>([]);

  const confirmTarget = (clientes ?? []).find((c) => c.id === confirmId) ?? null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nombre:    c.nombre,
      apellido:  c.apellido,
      correo:    c.correo    ?? '',
      telefono:  c.telefono  ?? '',
      direccion: c.direccion ?? '',
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

    const payload: Partial<Cliente> = {
      nombre:    form.nombre.trim(),
      apellido:  form.apellido.trim(),
      correo:    form.correo.trim()    || undefined,
      telefono:  form.telefono.trim()  || undefined,
      direccion: form.direccion.trim() || undefined,
    };

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload });
        setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
        closeModal();
        setNotify({ type: 'success', title: 'Cliente actualizado', message: 'Los cambios se guardaron correctamente.' });
      } else {
        const created = await createMut.mutateAsync(payload);
        if (created?.id) setRecentIds((prev) => [created.id, ...prev]);
        closeModal();
        setNotify({ type: 'success', title: 'Cliente creado', message: 'El cliente se registró correctamente.' });
      }
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el cliente.');
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmTarget) return;
    try {
      await deactMut.mutateAsync(confirmTarget.id);
      setRecentIds((prev) => [confirmTarget.id, ...prev.filter((x) => x !== confirmTarget.id)]);
      setConfirmId(null);
      setNotify({ type: 'success', title: 'Cliente eliminado', message: `"${confirmTarget.nombre} ${confirmTarget.apellido}" fue desactivado.` });
    } catch (err: unknown) {
      setConfirmId(null);
      setNotify({ type: 'error', title: 'Error', message: (err as Error).message ?? 'No se pudo completar la operación.' });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  const sorted = useMemo(() => {
    return [...(clientes ?? [])].sort((a, b) => {
      const ai = recentIds.indexOf(a.id), bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
  }, [clientes, recentIds]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTab !== 'todos') list = list.filter((c) => c.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        (c.correo ?? '').toLowerCase().includes(q) ||
        (c.telefono ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filterTab, search]);

  const tabCounts = useMemo(() => {
    const all = clientes ?? [];
    return {
      todos:    all.length,
      activo:   all.filter((c) => c.estado === 'activo').length,
      inactivo: all.filter((c) => c.estado === 'inactivo').length,
    };
  }, [clientes]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (c: Cliente) => (
        <span className="font-medium text-foreground">{c.nombre} {c.apellido}</span>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (c: Cliente) => (
        <span className="text-muted-foreground">{c.correo ?? '—'}</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (c: Cliente) => (
        <span className="text-muted-foreground">{c.telefono ?? '—'}</span>
      ),
    },
    {
      key: 'direccion',
      header: 'Dirección',
      render: (c: Cliente) => (
        <span className="max-w-44 truncate text-muted-foreground" title={c.direccion ?? ''}>
          {c.direccion ?? '—'}
        </span>
      ),
    },
    {
      key: 'fechaRegistro',
      header: 'Registro',
      render: (c: Cliente) => (
        <span className="text-muted-foreground">{fmtFecha(c.fechaRegistro)}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (c: Cliente) => (
        <Badge variant={c.estado === 'activo' ? 'success' : 'muted'}>{c.estado}</Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (c: Cliente) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmId(c.id)} disabled={deactMut.isPending} className="gap-1.5 text-xs">
            <Trash2 className="h-3 w-3" /> Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando clientes…" /></div>;
  if (error)     return <div className="p-8"><ErrorState title="Error al cargar clientes" error={error} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Clientes"
        description="Gestiona la información de clientes de RetroSound"
        icon={<Users className="h-5 w-5" />}
        action={<Button size="sm" onClick={openCreate}>+ Nuevo cliente</Button>}
      />

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
            placeholder="Buscar por nombre, correo…"
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'No hay clientes'}
          description={search || filterTab !== 'todos' ? 'Ajusta la búsqueda o los filtros.' : 'Registra el primer cliente.'}
          action={!search && filterTab === 'todos' ? <Button size="sm" onClick={openCreate}>+ Nuevo cliente</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns as any} data={filtered} getRowKey={(c) => (c as Cliente).id} />
      )}

      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Eliminar cliente?"
        description={confirmTarget ? `"${confirmTarget.nombre} ${confirmTarget.apellido}" será desactivado del sistema.` : undefined}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deactMut.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmId(null)}
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        description={editing ? `Editando: ${editing.nombre} ${editing.apellido}` : 'Completa los datos del nuevo cliente.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>Cancelar</Button>
            <Button form="cliente-form" type="submit" loading={isSaving} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="cliente-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nombre <span className="text-danger">*</span></label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: María" className={FIELD} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Apellido <span className="text-danger">*</span></label>
              <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: González" className={FIELD} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Correo <span className="text-danger">*</span></label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="cliente@email.com" className={FIELD} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 5555-1234" className={FIELD} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Ej: Zona 10, Guatemala" className={FIELD} />
            </div>
          </div>
        </form>
      </FormModal>

    </main>
  );
}

export default function ClientesPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_ventas']}>
      <ClientesContent />
    </RoleGuard>
  );
}

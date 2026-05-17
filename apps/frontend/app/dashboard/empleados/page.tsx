'use client';

import { useState, useMemo } from 'react';
import { Briefcase, Pencil, PowerOff } from 'lucide-react';
import {
  useEmpleados,
  useCreateEmpleado,
  useUpdateEmpleado,
  useDeactivateEmpleado,
} from '@/hooks/use-empleados';
import type { EmpleadoAdmin } from '@/types';
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
import type { CreateEmpleadoDto, UpdateEmpleadoDto } from '@/lib/services/empleados';

// ─── helpers ──────────────────────────────────────────────────────────────────

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

function fmtFecha(raw?: string | Date | null) {
  return raw ? String(raw).slice(0, 10) : '—';
}

function rolVariant(rol?: string) {
  if (rol === 'empleado_ventas')     return 'info'      as const;
  if (rol === 'empleado_inventario') return 'secondary' as const;
  return 'muted' as const;
}

// ─── forms ────────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM: CreateEmpleadoDto = {
  nombre:            '',
  apellido:          '',
  correo:            '',
  telefono:          '',
  fechaContratacion: todayStr(),
};

function validate(f: CreateEmpleadoDto): string | null {
  if (!f.nombre.trim())   return 'El nombre es obligatorio.';
  if (!f.apellido.trim()) return 'El apellido es obligatorio.';
  if (!f.fechaContratacion) return 'La fecha de contratación es obligatoria.';
  if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) return 'El correo no tiene un formato válido.';
  return null;
}

// ─── page content ─────────────────────────────────────────────────────────────

function EmpleadosContent() {
  const { data: empleados, isLoading, error } = useEmpleados();
  const createMut = useCreateEmpleado();
  const updateMut = useUpdateEmpleado();
  const deactMut  = useDeactivateEmpleado();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<EmpleadoAdmin | null>(null);
  const [form,      setForm]      = useState<CreateEmpleadoDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [notify,    setNotify]    = useState<{ type: 'success'|'error'; title: string; message: string } | null>(null);
  const [recentIds, setRecentIds] = useState<number[]>([]);

  const confirmTarget = (empleados ?? []).find((e) => e.id === confirmId) ?? null;

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, fechaContratacion: todayStr() });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(e: EmpleadoAdmin) {
    setEditing(e);
    setForm({
      nombre:            e.nombre,
      apellido:          e.apellido,
      correo:            e.correo    ?? '',
      telefono:          e.telefono  ?? '',
      fechaContratacion: fmtFecha(e.fechaContratacion),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM, fechaContratacion: todayStr() });
    setFormError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }
    setFormError(null);

    const payload: UpdateEmpleadoDto = {
      nombre:            form.nombre.trim(),
      apellido:          form.apellido.trim(),
      correo:            form.correo?.trim()   || undefined,
      telefono:          form.telefono?.trim() || undefined,
      fechaContratacion: form.fechaContratacion,
    };

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload });
        setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
        closeModal();
        setNotify({ type: 'success', title: 'Empleado actualizado', message: 'Los cambios se guardaron correctamente.' });
      } else {
        const created = await createMut.mutateAsync(form);
        if (created?.id) setRecentIds((prev) => [created.id, ...prev]);
        closeModal();
        setNotify({ type: 'success', title: 'Empleado creado', message: 'El empleado se registró correctamente.' });
      }
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el empleado.');
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmTarget) return;
    try {
      await deactMut.mutateAsync(confirmTarget.id);
      setRecentIds((prev) => [confirmTarget.id, ...prev.filter((x) => x !== confirmTarget.id)]);
      setConfirmId(null);
      setNotify({ type: 'success', title: 'Empleado desactivado', message: `"${confirmTarget.nombre} ${confirmTarget.apellido}" pasó a estado inactivo.` });
    } catch (err: unknown) {
      setConfirmId(null);
      setNotify({ type: 'error', title: 'Error', message: (err as Error).message ?? 'No se pudo completar la operación.' });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  const sorted = useMemo(() => {
    return [...(empleados ?? [])].sort((a, b) => {
      const ai = recentIds.indexOf(a.id), bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
  }, [empleados, recentIds]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTab !== 'todos') list = list.filter((e) => e.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.apellido.toLowerCase().includes(q) ||
        (e.correo ?? '').toLowerCase().includes(q) ||
        (e.telefono ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filterTab, search]);

  const tabCounts = useMemo(() => {
    const all = empleados ?? [];
    return {
      todos:    all.length,
      activo:   all.filter((e) => e.estado === 'activo').length,
      inactivo: all.filter((e) => e.estado === 'inactivo').length,
    };
  }, [empleados]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (e: EmpleadoAdmin) => (
        <span className="font-medium text-foreground">{e.nombre} {e.apellido}</span>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (e: EmpleadoAdmin) => (
        <span className="text-muted-foreground">{e.correo ?? '—'}</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (e: EmpleadoAdmin) => (
        <span className="text-muted-foreground">{e.telefono ?? '—'}</span>
      ),
    },
    {
      key: 'fechaContratacion',
      header: 'Contratado',
      render: (e: EmpleadoAdmin) => (
        <span className="text-muted-foreground">{fmtFecha(e.fechaContratacion)}</span>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (e: EmpleadoAdmin) => {
        if (!e.usuario) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-foreground">{e.usuario.correo}</span>
            <Badge variant={rolVariant(e.usuario.rol)} className="w-fit text-[10px]">
              {e.usuario.rol}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (e: EmpleadoAdmin) => (
        <Badge variant={e.estado === 'activo' ? 'success' : 'muted'}>{e.estado}</Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (e: EmpleadoAdmin) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(e)} className="gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Editar
          </Button>
          {e.estado !== 'inactivo' && (
            <Button variant="danger" size="sm" onClick={() => setConfirmId(e.id)} disabled={deactMut.isPending} className="gap-1.5 text-xs">
              <PowerOff className="h-3 w-3" /> Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando empleados…" /></div>;
  if (error)     return <div className="p-8"><ErrorState title="Error al cargar empleados" error={error} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Empleados"
        description="Gestiona colaboradores y roles operativos"
        icon={<Briefcase className="h-5 w-5" />}
        action={<Button size="sm" onClick={openCreate}>+ Nuevo empleado</Button>}
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
            placeholder="Buscar por nombre, correo, teléfono…"
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
          icon={<Briefcase className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'No hay empleados'}
          description={search || filterTab !== 'todos' ? 'Ajusta la búsqueda o los filtros.' : 'Registra el primer empleado.'}
          action={!search && filterTab === 'todos' ? <Button size="sm" onClick={openCreate}>+ Nuevo empleado</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns as any} data={filtered} getRowKey={(e) => (e as EmpleadoAdmin).id} />
      )}

      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Desactivar empleado?"
        description={confirmTarget ? `"${confirmTarget.nombre} ${confirmTarget.apellido}" pasará a estado inactivo.` : undefined}
        confirmLabel="Desactivar"
        variant="danger"
        loading={deactMut.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmId(null)}
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar empleado' : 'Nuevo empleado'}
        description={editing ? `Editando: ${editing.nombre} ${editing.apellido}` : 'Completa los datos del nuevo empleado.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>Cancelar</Button>
            <Button form="empleado-form" type="submit" loading={isSaving} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="empleado-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nombre <span className="text-danger">*</span></label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Carlos" className={FIELD} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Apellido <span className="text-danger">*</span></label>
              <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: Ramírez" className={FIELD} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Correo</label>
              <input name="correo" type="email" value={form.correo ?? ''} onChange={handleChange} placeholder="empleado@email.com" className={FIELD} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Teléfono</label>
              <input name="telefono" value={form.telefono ?? ''} onChange={handleChange} placeholder="Ej: 5555-1234" className={FIELD} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Fecha de contratación <span className="text-danger">*</span></label>
            <input name="fechaContratacion" type="date" value={form.fechaContratacion} onChange={handleChange} className={FIELD} />
          </div>
        </form>
      </FormModal>

    </main>
  );
}

export default function EmpleadosPage() {
  return (
    <RoleGuard allowed={['admin']}>
      <EmpleadosContent />
    </RoleGuard>
  );
}

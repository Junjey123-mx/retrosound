'use client';

import { useState, useMemo } from 'react';
import { ShieldCheck, Pencil, PowerOff } from 'lucide-react';
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeactivateUsuario,
} from '@/hooks/use-usuarios';
import type { UsuarioAdmin } from '@/types';
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

// ─── constants ────────────────────────────────────────────────────────────────

const VALID_ROLES = ['admin', 'empleado_ventas', 'empleado_inventario', 'cliente', 'proveedor'] as const;
type ValidRole = typeof VALID_ROLES[number];

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

// ─── helpers ──────────────────────────────────────────────────────────────────

function rolVariant(rol: string) {
  if (rol === 'admin')                return 'danger'    as const;
  if (rol === 'empleado_ventas')      return 'info'      as const;
  if (rol === 'empleado_inventario')  return 'secondary' as const;
  if (rol === 'cliente')              return 'success'   as const;
  if (rol === 'proveedor')            return 'warning'   as const;
  return 'muted' as const;
}

function estadoVariant(estado: string) {
  if (estado === 'activo')   return 'success' as const;
  if (estado === 'bloqueado') return 'warning' as const;
  return 'muted' as const;
}

// ─── forms ────────────────────────────────────────────────────────────────────

const EMPTY_CREATE = { correo: '', contrasena: '', rol: '' as ValidRole | '' };
const EMPTY_EDIT   = { rol: '' as ValidRole | '', estado: '' };

function validateCreate(f: typeof EMPTY_CREATE): string | null {
  if (!f.correo.trim())  return 'El correo es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) return 'El correo no tiene un formato válido.';
  if (!f.contrasena || f.contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!f.rol) return 'El rol es obligatorio.';
  return null;
}

function validateEdit(f: typeof EMPTY_EDIT): string | null {
  if (!f.rol) return 'El rol es obligatorio.';
  return null;
}

// ─── page content ─────────────────────────────────────────────────────────────

function UsuariosContent() {
  const { data: usuarios, isLoading, error } = useUsuarios();
  const createMut = useCreateUsuario();
  const updateMut = useUpdateUsuario();
  const deactMut  = useDeactivateUsuario();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<UsuarioAdmin | null>(null);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [confirmId,  setConfirmId]  = useState<number | null>(null);
  const [notify,     setNotify]     = useState<{ type: 'success'|'error'; title: string; message: string } | null>(null);
  const [recentIds,  setRecentIds]  = useState<number[]>([]);

  const confirmTarget = (usuarios ?? []).find((u) => u.id === confirmId) ?? null;

  function openCreate() {
    setEditing(null);
    setCreateForm(EMPTY_CREATE);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(u: UsuarioAdmin) {
    setEditing(u);
    setEditForm({ rol: u.rol, estado: u.estado });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setCreateForm(EMPTY_CREATE);
    setEditForm(EMPTY_EDIT);
    setFormError(null);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (editing) {
      const err = validateEdit(editForm);
      if (err) { setFormError(err); return; }
      setFormError(null);
      try {
        await updateMut.mutateAsync({ id: editing.id, data: { rol: editForm.rol || undefined, estado: editForm.estado || undefined } });
        setRecentIds((prev) => [editing.id, ...prev.filter((x) => x !== editing.id)]);
        closeModal();
        setNotify({ type: 'success', title: 'Usuario actualizado', message: 'Los cambios se guardaron correctamente.' });
      } catch (err: unknown) {
        setFormError((err as Error).message ?? 'Error al actualizar el usuario.');
      }
    } else {
      const err = validateCreate(createForm);
      if (err) { setFormError(err); return; }
      setFormError(null);
      try {
        const created = await createMut.mutateAsync({ correo: createForm.correo.trim(), contrasena: createForm.contrasena, rol: createForm.rol as string });
        if (created?.id) setRecentIds((prev) => [created.id, ...prev]);
        closeModal();
        setNotify({ type: 'success', title: 'Usuario creado', message: 'La cuenta se creó correctamente.' });
      } catch (err: unknown) {
        setFormError((err as Error).message ?? 'Error al crear el usuario.');
      }
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmTarget) return;
    try {
      await deactMut.mutateAsync(confirmTarget.id);
      setRecentIds((prev) => [confirmTarget.id, ...prev.filter((x) => x !== confirmTarget.id)]);
      setConfirmId(null);
      setNotify({ type: 'success', title: 'Usuario desactivado', message: `"${confirmTarget.correo}" pasó a estado inactivo.` });
    } catch (err: unknown) {
      setConfirmId(null);
      setNotify({ type: 'error', title: 'Error', message: (err as Error).message ?? 'No se pudo completar la operación.' });
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  const sorted = useMemo(() => {
    return [...(usuarios ?? [])].sort((a, b) => {
      const ai = recentIds.indexOf(a.id), bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1; if (bi === -1) return -1;
      return ai - bi;
    });
  }, [usuarios, recentIds]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTab !== 'todos') list = list.filter((u) => u.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.correo.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q) ||
        u.estado.toLowerCase().includes(q),
      );
    }
    return list;
  }, [sorted, filterTab, search]);

  const tabCounts = useMemo(() => {
    const all = usuarios ?? [];
    return {
      todos:     all.length,
      activo:    all.filter((u) => u.estado === 'activo').length,
      bloqueado: all.filter((u) => u.estado === 'bloqueado').length,
      inactivo:  all.filter((u) => u.estado === 'inactivo').length,
    };
  }, [usuarios]);

  const columns = [
    {
      key: 'correo',
      header: 'Correo',
      render: (u: UsuarioAdmin) => <span className="font-medium text-foreground">{u.correo}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (u: UsuarioAdmin) => <Badge variant={rolVariant(u.rol)}>{u.rol}</Badge>,
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (u: UsuarioAdmin) => (
        <Badge variant={estadoVariant(u.estado)}>{u.estado}</Badge>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (u: UsuarioAdmin) => (
        <span className="text-muted-foreground">
          {u.cliente ? `${u.cliente.nombre} ${u.cliente.apellido}` : u.idCliente ? `#${u.idCliente}` : '—'}
        </span>
      ),
    },
    {
      key: 'empleado',
      header: 'Empleado',
      render: (u: UsuarioAdmin) => (
        <span className="text-muted-foreground">
          {u.empleado ? `${u.empleado.nombre} ${u.empleado.apellido}` : u.idEmpleado ? `#${u.idEmpleado}` : '—'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (u: UsuarioAdmin) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Editar
          </Button>
          {u.estado !== 'inactivo' && (
            <Button variant="danger" size="sm" onClick={() => setConfirmId(u.id)} disabled={deactMut.isPending} className="gap-1.5 text-xs">
              <PowerOff className="h-3 w-3" /> Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando usuarios…" /></div>;
  if (error)     return <div className="p-8"><ErrorState title="Error al cargar usuarios" error={error} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Usuarios"
        description="Administra accesos, roles y estado de cuentas"
        icon={<ShieldCheck className="h-5 w-5" />}
        action={<Button size="sm" onClick={openCreate}>+ Nuevo usuario</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={[
            { value: 'todos',     label: 'Todos',     count: tabCounts.todos     },
            { value: 'activo',    label: 'Activos',   count: tabCounts.activo    },
            { value: 'bloqueado', label: 'Bloqueados', count: tabCounts.bloqueado },
            { value: 'inactivo',  label: 'Inactivos', count: tabCounts.inactivo  },
          ]}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por correo, rol, estado…"
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
          icon={<ShieldCheck className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'No hay usuarios'}
          description={search || filterTab !== 'todos' ? 'Ajusta la búsqueda o los filtros.' : 'Crea la primera cuenta de usuario.'}
          action={!search && filterTab === 'todos' ? <Button size="sm" onClick={openCreate}>+ Nuevo usuario</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns as any} data={filtered} getRowKey={(u) => (u as UsuarioAdmin).id} />
      )}

      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Desactivar usuario?"
        description={confirmTarget ? `"${confirmTarget.correo}" pasará a estado inactivo.` : undefined}
        confirmLabel="Desactivar"
        variant="danger"
        loading={deactMut.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmId(null)}
      />

      <FormModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        description={editing ? `Editando: ${editing.correo}` : 'Crea una nueva cuenta de acceso.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>Cancelar</Button>
            <Button form="usuario-form" type="submit" loading={isSaving} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="usuario-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</div>
          )}

          {!editing ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Correo <span className="text-danger">*</span></label>
                <input
                  name="correo" type="email"
                  value={createForm.correo}
                  onChange={(e) => setCreateForm((p) => ({ ...p, correo: e.target.value }))}
                  placeholder="usuario@retrosound.com"
                  className={FIELD}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Contraseña <span className="text-danger">*</span></label>
                <input
                  name="contrasena" type="password"
                  value={createForm.contrasena}
                  onChange={(e) => setCreateForm((p) => ({ ...p, contrasena: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  className={FIELD}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Rol <span className="text-danger">*</span></label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm((p) => ({ ...p, rol: e.target.value as ValidRole }))}
                  className={FIELD}
                >
                  <option value="">Seleccionar rol…</option>
                  {VALID_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Rol <span className="text-danger">*</span></label>
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm((p) => ({ ...p, rol: e.target.value as ValidRole }))}
                  className={FIELD}
                >
                  <option value="">Seleccionar rol…</option>
                  {VALID_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Estado</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm((p) => ({ ...p, estado: e.target.value }))}
                  className={FIELD}
                >
                  <option value="">Sin cambiar</option>
                  <option value="activo">activo</option>
                  <option value="bloqueado">bloqueado</option>
                  <option value="inactivo">inactivo</option>
                </select>
              </div>
            </>
          )}
        </form>
      </FormModal>

    </main>
  );
}

export default function UsuariosPage() {
  return (
    <RoleGuard allowed={['admin']}>
      <UsuariosContent />
    </RoleGuard>
  );
}

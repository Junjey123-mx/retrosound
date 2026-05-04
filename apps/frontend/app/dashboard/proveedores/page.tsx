'use client';

import { useState } from 'react';
import {
  useProveedores,
  useCreateProveedor,
  useUpdateProveedor,
  useDeactivateProveedor,
} from '@/hooks/use-proveedores';
import type { Proveedor } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

const ESTADO_BADGE: Record<string, string> = {
  activo:   'rs-badge-completada',
  inactivo: 'rs-badge-cancelada',
};

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

const INPUT = 'w-full rounded-xl border border-input bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25';

export default function ProveedoresPage() {
  const { data: proveedores, isLoading, error: loadError } = useProveedores();
  const createMut = useCreateProveedor();
  const updateMut = useUpdateProveedor();
  const deactMut  = useDeactivateProveedor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Proveedor | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
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
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
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
        flash('Proveedor actualizado correctamente.');
      } else {
        await createMut.mutateAsync(payload);
        flash('Proveedor creado correctamente.');
      }
      closeDialog();
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el proveedor.');
    }
  }

  async function handleDeactivate(p: Proveedor) {
    if (!confirm(`¿Desactivar al proveedor "${p.nombre}"?\nEl proveedor pasará a estado inactivo.`)) return;
    try {
      await deactMut.mutateAsync(p.id);
      flash(`Proveedor "${p.nombre}" desactivado.`);
    } catch (err: unknown) {
      alert((err as Error).message ?? 'Error al desactivar el proveedor.');
    }
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando proveedores…</p>;
  if (loadError)  return <p className="p-8 text-destructive">Error al cargar proveedores.</p>;

  const activos   = proveedores?.filter((p) => p.estado === 'activo').length ?? 0;
  const inactivos = proveedores?.filter((p) => p.estado !== 'activo').length ?? 0;

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">{activos} activos · {inactivos} inactivos</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover hover:shadow-md"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {successMsg}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background-soft">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dirección</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {proveedores?.map((p) => (
              <tr key={p.id} className="rs-table-row">
                <td className="px-4 py-3 font-medium text-foreground">{p.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.nombreContacto ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.correo ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.telefono ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.direccion ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ''}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rs-btn-edit inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    {p.estado === 'activo' && (
                      <button
                        onClick={() => handleDeactivate(p)}
                        disabled={deactMut.isPending}
                        className="rs-btn-danger inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" /> Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {proveedores?.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay proveedores registrados.</p>
        )}
      </div>

      {/* Modal crear / editar */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card shadow-xl border border-border">

            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">

                {formError && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input name="nombre" value={form.nombre} onChange={handleChange}
                    placeholder="Ej: Distribuidora Musical S.A." className={INPUT} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Nombre de contacto</label>
                  <input name="nombreContacto" value={form.nombreContacto} onChange={handleChange}
                    placeholder="Ej: Juan Pérez" className={INPUT} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Correo</label>
                    <input name="correo" type="email" value={form.correo} onChange={handleChange}
                      placeholder="proveedor@email.com" className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange}
                      placeholder="Ej: 5555-1234" className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Dirección</label>
                  <textarea name="direccion" value={form.direccion} onChange={handleChange}
                    rows={2} placeholder="Ej: 6a Av. 1-22, Zona 1, Ciudad de Guatemala"
                    className={INPUT} />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-border bg-input-bg px-4 py-2 text-sm font-medium text-foreground rs-hover-brand hover:text-brand"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover hover:shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}

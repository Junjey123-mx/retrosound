'use client';

import { useState } from 'react';
import {
  useProveedores,
  useCreateProveedor,
  useUpdateProveedor,
  useDeactivateProveedor,
} from '@/hooks/use-proveedores';
import type { Proveedor } from '@/types';

// ─── Colores por estado ───────────────────────────────────────────────────────
const ESTADO_BADGE: Record<string, string> = {
  activo:   'bg-green-100 text-green-800',
  inactivo: 'bg-gray-100 text-gray-600',
};

// ─── Estado vacío del formulario ──────────────────────────────────────────────
const EMPTY_FORM = {
  nombre:         '',
  correo:         '',
  telefono:       '',
  direccion:      '',
  nombreContacto: '',
};

type FormState = typeof EMPTY_FORM;

// ─── Validación ───────────────────────────────────────────────────────────────
function validate(f: FormState): string | null {
  if (!f.nombre.trim()) return 'El nombre del proveedor es obligatorio.';
  if (f.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo))
    return 'El correo no tiene un formato válido.';
  return null;
}

// ─── Página principal ─────────────────────────────────────────────────────────
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

  // ── Abrir diálogo ────────────────────────────────────────────────────────
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

  // ── Cambios en el formulario ─────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
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

  // ── Desactivar ───────────────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────
  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando proveedores…</p>;
  if (loadError)  return <p className="p-8 text-red-600">Error al cargar proveedores.</p>;

  const activos   = proveedores?.filter((p) => p.estado === 'activo').length ?? 0;
  const inactivos = proveedores?.filter((p) => p.estado !== 'activo').length ?? 0;

  return (
    <main className="p-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activos} activos · {inactivos} inactivos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="mt-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contacto</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Correo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Teléfono</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Dirección</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {proveedores?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{p.nombreContacto ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.correo ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.telefono ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.direccion ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ''}`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    {p.estado === 'activo' && (
                      <button
                        onClick={() => handleDeactivate(p)}
                        disabled={deactMut.isPending}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {proveedores?.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No hay proveedores registrados.</p>
        )}
      </div>

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">

            {/* Cabecera */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">

                {/* Error de validación */}
                {formError && (
                  <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Distribuidora Musical S.A."
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nombre de contacto */}
                <div>
                  <label className="mb-1 block text-sm font-medium">Nombre de contacto</label>
                  <input
                    name="nombreContacto"
                    value={form.nombreContacto}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Correo */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Correo</label>
                    <input
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={handleChange}
                      placeholder="proveedor@email.com"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Teléfono</label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 5555-1234"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="mb-1 block text-sm font-medium">Dirección</label>
                  <textarea
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ej: 6a Av. 1-22, Zona 1, Ciudad de Guatemala"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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

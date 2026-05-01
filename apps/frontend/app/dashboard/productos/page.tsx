'use client';

import { useState } from 'react';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useDeactivateProducto,
} from '@/hooks/use-productos';
import { useCatalogos } from '@/hooks/use-catalogs';
import type { Producto } from '@/types';

// ─── Colores por estado ───────────────────────────────────────────────────────
const ESTADO_BADGE: Record<string, string> = {
  activo:        'bg-green-100 text-green-800',
  inactivo:      'bg-gray-100 text-gray-600',
  agotado:       'bg-yellow-100 text-yellow-800',
  descontinuado: 'bg-red-100 text-red-700',
};

// ─── Estado vacío del formulario ──────────────────────────────────────────────
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

// ─── Validación ───────────────────────────────────────────────────────────────
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

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ProductosPage() {
  const { data: productos, isLoading, error: loadError } = useProductos();
  const { data: catalogos } = useCatalogos();
  const createMut  = useCreateProducto();
  const updateMut  = useUpdateProducto();
  const deactMut   = useDeactivateProducto();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Producto | null>(null);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
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
        flash('Producto actualizado correctamente.');
      } else {
        await createMut.mutateAsync(payload);
        flash('Producto creado correctamente.');
      }
      closeDialog();
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al guardar el producto.');
    }
  }

  // ── Desactivar ───────────────────────────────────────────────────────────
  async function handleDeactivate(p: Producto) {
    if (!confirm(`¿Desactivar "${p.titulo}"?\nEl producto pasará a estado "descontinuado".`)) return;
    try {
      await deactMut.mutateAsync(p.id);
      flash(`Producto "${p.titulo}" desactivado.`);
    } catch (err: unknown) {
      alert((err as Error).message ?? 'Error al desactivar el producto.');
    }
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  // ── Render ───────────────────────────────────────────────────────────────
  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando productos…</p>;
  if (loadError)  return <p className="p-8 text-red-600">Error al cargar productos.</p>;

  return (
    <main className="p-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {productos?.length ?? 0} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo Producto
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
              <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Título</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Categoría</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Formato</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Stock</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.codigoSku}</td>
                <td className="px-4 py-3 font-medium">{p.titulo}</td>
                <td className="px-4 py-3 text-gray-500">{p.categoria?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.formato?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-right">Q{Number(p.precioVenta).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{p.stockActual}</td>
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
                    {p.estado !== 'descontinuado' && (
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

        {productos?.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No hay productos registrados.</p>
        )}
      </div>

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">

            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                {editing ? 'Editar Producto' : 'Nuevo Producto'}
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
              <div className="max-h-[65vh] overflow-y-auto px-6 py-4">

                {/* Error de validación */}
                {formError && (
                  <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">

                  {/* Título */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChange}
                      placeholder="Ej: The Dark Side of the Moon"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="codigoSku"
                      value={form.codigoSku}
                      onChange={handleChange}
                      placeholder="Ej: RS-001-V"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Año */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Año de lanzamiento</label>
                    <input
                      name="anioLanzamiento"
                      type="number"
                      min="1900"
                      max="2099"
                      value={form.anioLanzamiento}
                      onChange={handleChange}
                      placeholder="Ej: 1973"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Precio (Q) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="precioVenta"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precioVenta}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Stock actual */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Stock actual <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="stockActual"
                      type="number"
                      min="0"
                      value={form.stockActual}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Stock mínimo */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Stock mínimo <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="stockMinimo"
                      type="number"
                      min="0"
                      value={form.stockMinimo}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idCategoria"
                      value={form.idCategoria}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar…</option>
                      {catalogos?.categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Formato */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Formato <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idFormato"
                      value={form.idFormato}
                      onChange={handleChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar…</option>
                      {catalogos?.formatos.map((f) => (
                        <option key={f.id} value={f.id}>{f.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Descripción */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Descripción opcional del producto…"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                </div>
              </div>

              {/* Botones del modal */}
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

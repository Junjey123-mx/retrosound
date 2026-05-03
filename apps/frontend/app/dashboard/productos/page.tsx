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

const ESTADO_BADGE: Record<string, string> = {
  activo:        'border border-success/20 bg-success/10 text-success',
  inactivo:      'border border-border bg-background-soft text-muted-foreground',
  agotado:       'border border-warning/30 bg-warning/10 text-warning',
  descontinuado: 'border border-destructive/30 bg-destructive/10 text-destructive',
};

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

const INPUT = 'w-full rounded-xl border border-input bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25';
const SELECT = 'w-full rounded-xl border border-input bg-input-bg px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25';

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

  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando productos…</p>;
  if (loadError)  return <p className="p-8 text-destructive">Error al cargar productos.</p>;

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{productos?.length ?? 0} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover hover:shadow-md"
        >
          + Nuevo Producto
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Título</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Formato</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productos?.map((p) => (
              <tr key={p.id} className="rs-table-row">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.codigoSku}</td>
                <td className="px-4 py-3 font-medium text-foreground">{p.titulo}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.categoria?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.formato?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-right text-foreground">Q{Number(p.precioVenta).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-foreground">{p.stockActual}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ''}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-info transition-colors hover:bg-brand-soft hover:text-brand"
                    >
                      Editar
                    </button>
                    {p.estado !== 'descontinuado' && (
                      <button
                        onClick={() => handleDeactivate(p)}
                        disabled={deactMut.isPending}
                        className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
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
          <p className="py-10 text-center text-sm text-muted-foreground">No hay productos registrados.</p>
        )}
      </div>

      {/* Modal crear / editar */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card shadow-xl border border-border">

            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editing ? 'Editar Producto' : 'Nuevo Producto'}
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
              <div className="max-h-[65vh] overflow-y-auto px-6 py-4">

                {formError && (
                  <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Título <span className="text-destructive">*</span>
                    </label>
                    <input name="titulo" value={form.titulo} onChange={handleChange}
                      placeholder="Ej: The Dark Side of the Moon" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      SKU <span className="text-destructive">*</span>
                    </label>
                    <input name="codigoSku" value={form.codigoSku} onChange={handleChange}
                      placeholder="Ej: RS-001-V" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Año de lanzamiento</label>
                    <input name="anioLanzamiento" type="number" min="1900" max="2099"
                      value={form.anioLanzamiento} onChange={handleChange}
                      placeholder="Ej: 1973" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Precio (Q) <span className="text-destructive">*</span>
                    </label>
                    <input name="precioVenta" type="number" step="0.01" min="0"
                      value={form.precioVenta} onChange={handleChange}
                      placeholder="0.00" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Stock actual <span className="text-destructive">*</span>
                    </label>
                    <input name="stockActual" type="number" min="0"
                      value={form.stockActual} onChange={handleChange}
                      placeholder="0" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Stock mínimo <span className="text-destructive">*</span>
                    </label>
                    <input name="stockMinimo" type="number" min="0"
                      value={form.stockMinimo} onChange={handleChange}
                      placeholder="0" className={INPUT} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Categoría <span className="text-destructive">*</span>
                    </label>
                    <select name="idCategoria" value={form.idCategoria} onChange={handleChange} className={SELECT}>
                      <option value="">Seleccionar…</option>
                      {catalogos?.categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Formato <span className="text-destructive">*</span>
                    </label>
                    <select name="idFormato" value={form.idFormato} onChange={handleChange} className={SELECT}>
                      <option value="">Seleccionar…</option>
                      {catalogos?.formatos.map((f) => (
                        <option key={f.id} value={f.id}>{f.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Descripción</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                      rows={3} placeholder="Descripción opcional del producto…"
                      className={INPUT} />
                  </div>

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

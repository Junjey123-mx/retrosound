'use client';

import { useState, useMemo } from 'react';
import { ClipboardList, CheckCircle2, Eye } from 'lucide-react';
import { useRecepciones, useConfirmarRecepcion } from '@/hooks/use-inventario';
import type { RecepcionInventario, RecepcionDetalle } from '@/types';
import { RoleGuard }    from '@/components/guards/role-guard';
import { PageHeader }   from '@/components/ui/page-header';
import { DataTable }    from '@/components/ui/data-table';
import { Badge }        from '@/components/ui/badge';
import { Button }       from '@/components/ui/button';
import { SearchInput }  from '@/components/ui/search-input';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { FormModal }    from '@/components/ui/form-modal';
import { NotifyModal }  from '@/components/ui/notify-modal';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';
import { ROUTES }      from '@/lib/constants/routes';

// ─── helpers ──────────────────────────────────────────────────────────────────

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

function fmtFecha(raw?: string | null) {
  if (!raw) return '—';
  return String(raw).slice(0, 10);
}

function estadoVariant(estado: string) {
  switch (estado) {
    case 'pendiente': return 'warning'  as const;
    case 'parcial':   return 'info'     as const;
    case 'recibida':  return 'success'  as const;
    case 'cancelada': return 'muted'    as const;
    default:          return 'outline'  as const;
  }
}

function isConfirmable(recepcion: RecepcionInventario, detalle: RecepcionDetalle): boolean {
  if (recepcion.estado === 'cancelada' || recepcion.estado === 'recibida') return false;
  return detalle.cantidadRecibida === null || detalle.cantidadRecibida === 0;
}

const ESTADO_TABS = [
  { value: 'todos',     label: 'Todas'      },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'parcial',   label: 'Parciales'  },
  { value: 'recibida',  label: 'Recibidas'  },
  { value: 'cancelada', label: 'Canceladas' },
];

// ─── confirmar modal ──────────────────────────────────────────────────────────

interface ConfirmarDetalleModalProps {
  recepcion: RecepcionInventario;
  detalle: RecepcionDetalle;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

function ConfirmarDetalleModal({ recepcion, detalle, onClose, onSuccess }: ConfirmarDetalleModalProps) {
  const [cantidad, setCantidad] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const confirmarMut = useConfirmarRecepcion();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const num = Number(cantidad);
    if (!num || num <= 0) {
      setFormError('La cantidad recibida debe ser mayor a 0.');
      return;
    }
    setFormError(null);

    try {
      const result = await confirmarMut.mutateAsync({ idDetalle: detalle.id, dto: { cantidadRecibida: num } });
      onClose();
      onSuccess(result.mensaje ?? 'Recepción confirmada correctamente.');
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al confirmar la recepción.');
    }
  }

  const producto = detalle.producto;
  const exceedsWarning = Number(cantidad) > detalle.cantidadComprada && Number(cantidad) > 0;

  return (
    <FormModal
      open
      onClose={onClose}
      title="Confirmar recepción"
      description={`Recepción #${recepcion.id} — ${recepcion.proveedor?.nombre ?? '—'}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={confirmarMut.isPending}>
            Cancelar
          </Button>
          <Button form="confirmar-form" type="submit" loading={confirmarMut.isPending}>
            Confirmar
          </Button>
        </>
      }
    >
      <form id="confirmar-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium text-foreground">{producto?.titulo ?? '—'}</p>
          <p className="text-muted-foreground">SKU: {producto?.sku ?? '—'}</p>
          <p className="text-muted-foreground">Cantidad comprada: {detalle.cantidadComprada}</p>
          <p className="text-muted-foreground">
            Stock actual: {producto?.stockActual ?? '—'} / Mínimo: {producto?.stockMinimo ?? '—'}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Cantidad recibida <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej: 10"
            className={FIELD}
          />
          {exceedsWarning && (
            <p className="mt-1 text-xs text-warning">
              La cantidad supera la cantidad comprada ({detalle.cantidadComprada}). El servidor validará el límite.
            </p>
          )}
        </div>
      </form>
    </FormModal>
  );
}

// ─── detalle recepcion modal ──────────────────────────────────────────────────

interface DetalleRecepcionModalProps {
  recepcion: RecepcionInventario;
  onClose: () => void;
  onConfirmarDetalle: (detalle: RecepcionDetalle) => void;
}

function DetalleRecepcionModal({ recepcion, onClose, onConfirmarDetalle }: DetalleRecepcionModalProps) {
  return (
    <FormModal
      open
      onClose={onClose}
      title={`Recepción #${recepcion.id}`}
      description={`${recepcion.proveedor?.nombre ?? '—'} — ${fmtFecha(recepcion.fecha)}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Estado: </span>
            <Badge variant={estadoVariant(recepcion.estado)}>{recepcion.estado}</Badge>
          </div>
          {recepcion.empleado && (
            <div>
              <span className="text-muted-foreground">Empleado: </span>
              <span className="text-foreground">{recepcion.empleado.nombre}</span>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comprada</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recibida</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recepcion.detalles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Sin líneas de detalle
                  </td>
                </tr>
              ) : (
                recepcion.detalles.map((d) => {
                  const confirmable = isConfirmable(recepcion, d);
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5 text-foreground">{d.producto?.titulo ?? '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{d.producto?.sku ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right text-foreground">{d.cantidadComprada}</td>
                      <td className="px-3 py-2.5 text-right">
                        {d.cantidadRecibida != null && d.cantidadRecibida > 0
                          ? <span className="text-success font-medium">{d.cantidadRecibida}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {confirmable ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() => onConfirmarDetalle(d)}
                          >
                            <CheckCircle2 className="h-3 w-3" /> Confirmar
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {d.cantidadRecibida != null && d.cantidadRecibida > 0 ? 'Confirmado' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FormModal>
  );
}

// ─── page content ─────────────────────────────────────────────────────────────

function RecepcionesContent() {
  const { data, isLoading, error } = useRecepciones({ limit: 100 });

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');
  const [selected,  setSelected]  = useState<RecepcionInventario | null>(null);
  const [confirmingDetalle, setConfirmingDetalle] = useState<RecepcionDetalle | null>(null);
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const recepciones = data?.data ?? [];

  const filtered = useMemo(() => {
    let list = recepciones;
    if (filterTab !== 'todos') list = list.filter((r) => r.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        String(r.id).includes(q) ||
        (r.proveedor?.nombre ?? '').toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q) ||
        r.detalles.some((d) =>
          (d.producto?.titulo ?? '').toLowerCase().includes(q) ||
          (d.producto?.sku ?? '').toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }, [recepciones, filterTab, search]);

  const tabCounts = useMemo(() => ({
    todos:     recepciones.length,
    pendiente: recepciones.filter((r) => r.estado === 'pendiente').length,
    parcial:   recepciones.filter((r) => r.estado === 'parcial').length,
    recibida:  recepciones.filter((r) => r.estado === 'recibida').length,
    cancelada: recepciones.filter((r) => r.estado === 'cancelada').length,
  }), [recepciones]);

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (r: RecepcionInventario) => (
        <span className="font-mono text-xs text-muted-foreground">#{r.id}</span>
      ),
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      render: (r: RecepcionInventario) => (
        <span className="font-medium text-foreground">{r.proveedor?.nombre ?? '—'}</span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (r: RecepcionInventario) => (
        <span className="text-muted-foreground">{fmtFecha(r.fecha)}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (r: RecepcionInventario) => (
        <Badge variant={estadoVariant(r.estado)}>{r.estado}</Badge>
      ),
    },
    {
      key: 'detalles',
      header: 'Líneas',
      render: (r: RecepcionInventario) => (
        <span className="text-muted-foreground">{r.detalles.length}</span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (r: RecepcionInventario) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setSelected(r)}
        >
          <Eye className="h-3 w-3" /> Ver detalle
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Recepciones"
          description="Confirma entregas reportadas por proveedores"
          icon={<ClipboardList className="h-5 w-5" />}
          backHref={ROUTES.dashboard.inventario}
          backLabel="Inventario"
        />
        <LoadingState variant="table" label="Cargando recepciones…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 sm:p-8">
        <ErrorState title="Error al cargar recepciones" error={error} />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Recepciones"
        description="Confirma entregas reportadas por proveedores"
        icon={<ClipboardList className="h-5 w-5" />}
        backHref={ROUTES.dashboard.inventario}
        backLabel="Inventario"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={ESTADO_TABS.map((t) => ({ ...t, count: tabCounts[t.value as keyof typeof tabCounts] }))}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por proveedor, producto, SKU…"
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
          icon={<ClipboardList className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'Sin recepciones'}
          description={
            search || filterTab !== 'todos'
              ? 'Ajusta la búsqueda o los filtros.'
              : 'No hay recepciones registradas aún.'
          }
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered}
          getRowKey={(r) => (r as RecepcionInventario).id}
        />
      )}

      {notify && <NotifyModal {...notify} onClose={() => setNotify(null)} />}

      {selected && !confirmingDetalle && (
        <DetalleRecepcionModal
          recepcion={selected}
          onClose={() => setSelected(null)}
          onConfirmarDetalle={(d) => setConfirmingDetalle(d)}
        />
      )}

      {selected && confirmingDetalle && (
        <ConfirmarDetalleModal
          recepcion={selected}
          detalle={confirmingDetalle}
          onClose={() => setConfirmingDetalle(null)}
          onSuccess={(msg) => {
            setConfirmingDetalle(null);
            setNotify({ type: 'success', title: 'Recepción confirmada', message: msg });
          }}
        />
      )}

    </main>
  );
}

export function ReceptionsPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <RecepcionesContent />
    </RoleGuard>
  );
}

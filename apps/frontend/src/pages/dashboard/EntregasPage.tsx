'use client';

import { useState, useMemo } from 'react';
import { Truck, Eye, CheckCircle2, XCircle } from 'lucide-react';
import {
  useRecepciones,
  useConfirmarRecepcion,
  useCancelarRecepcion,
} from '@/hooks/use-inventario';
import type { RecepcionInventario, RecepcionDetalle } from '@/types';
import { RoleGuard }     from '@/components/guards/role-guard';
import { PageHeader }    from '@/components/ui/page-header';
import { DataTable }     from '@/components/ui/data-table';
import { Badge }         from '@/components/ui/badge';
import { Button }        from '@/components/ui/button';
import { SearchInput }   from '@/components/ui/search-input';
import { FilterTabs }    from '@/components/ui/filter-tabs';
import { FormModal }     from '@/components/ui/form-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NotifyModal }   from '@/components/ui/notify-modal';
import { LoadingState }  from '@/components/ui/loading-state';
import { ErrorState }    from '@/components/ui/error-state';
import { EmptyState }    from '@/components/ui/empty-state';

// ─── helpers ──────────────────────────────────────────────────────────────────

const FIELD = 'w-full rounded-xl border border-border bg-input-bg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition disabled:opacity-50';

function fmtFecha(raw?: string | null) {
  if (!raw) return '—';
  return String(raw).slice(0, 10);
}

function fmtQ(v: number) {
  return `Q${Number(v).toFixed(2)}`;
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

function firstDetalle(r: RecepcionInventario): RecepcionDetalle | null {
  return r.detalles[0] ?? null;
}

// ─── modal: detalle ───────────────────────────────────────────────────────────

interface DetalleModalProps {
  recepcion: RecepcionInventario;
  onClose: () => void;
}

function DetalleModal({ recepcion, onClose }: DetalleModalProps) {
  const d = firstDetalle(recepcion);
  const total = d ? d.cantidadComprada * d.costoUnitario : 0;

  return (
    <FormModal
      open
      onClose={onClose}
      title={`Entrega #${recepcion.id}`}
      description={`${recepcion.proveedor?.nombre ?? '—'} — ${fmtFecha(recepcion.fecha)}`}
      size="md"
    >
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground">ID entrega</p>
            <p className="font-mono font-medium text-foreground">#{recepcion.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha</p>
            <p className="text-foreground">{fmtFecha(recepcion.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Proveedor</p>
            <p className="text-foreground">{recepcion.proveedor?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant={estadoVariant(recepcion.estado)}>{recepcion.estado}</Badge>
          </div>
          {recepcion.empleado && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Recibido por</p>
              <p className="text-foreground">{recepcion.empleado.nombre}</p>
            </div>
          )}
        </div>

        {d && (
          <div className="rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campo</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">Producto</td>
                  <td className="px-3 py-2 text-right font-medium text-foreground">{d.producto?.titulo ?? '—'}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">SKU</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{d.producto?.sku ?? '—'}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">Cantidad reportada</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{d.cantidadComprada}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">Cantidad recibida</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(() => {
                      const displayed =
                        d.cantidadRecibida != null && d.cantidadRecibida > 0
                          ? d.cantidadRecibida
                          : recepcion.estado === 'recibida'
                          ? d.cantidadComprada
                          : null;
                      return displayed != null
                        ? <span className="font-medium text-success">{displayed}</span>
                        : <span className="text-muted-foreground">—</span>;
                    })()}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">Costo proveedor</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{fmtQ(d.costoUnitario)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-foreground">Total proveedor</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">{fmtQ(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FormModal>
  );
}

// ─── modal: recibir ───────────────────────────────────────────────────────────

interface RecibirModalProps {
  recepcion: RecepcionInventario;
  detalle: RecepcionDetalle;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function RecibirModal({ recepcion, detalle, onClose, onSuccess }: RecibirModalProps) {
  const [cantidad, setCantidad]   = useState(String(detalle.cantidadComprada));
  const [formError, setFormError] = useState<string | null>(null);
  const confirmarMut = useConfirmarRecepcion();

  const num = Number(cantidad);
  const estadoResultante = num > 0 && num < detalle.cantidadComprada ? 'parcial' : 'recibida';

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!num || num <= 0) {
      setFormError('La cantidad recibida debe ser mayor a 0.');
      return;
    }
    if (num > detalle.cantidadComprada) {
      setFormError(`La cantidad no puede superar la reportada (${detalle.cantidadComprada}).`);
      return;
    }
    setFormError(null);
    try {
      const result = await confirmarMut.mutateAsync({
        idDetalle: detalle.id,
        dto: { cantidadRecibida: num },
      });
      onClose();
      onSuccess(result.mensaje ?? 'Entrega confirmada correctamente.');
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al confirmar la entrega.');
    }
  }

  return (
    <FormModal
      open
      onClose={onClose}
      title="Recibir entrega"
      description={`#${recepcion.id} — ${recepcion.proveedor?.nombre ?? '—'}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={confirmarMut.isPending}>
            Cancelar
          </Button>
          <Button form="recibir-form" type="submit" loading={confirmarMut.isPending}>
            Confirmar
          </Button>
        </>
      }
    >
      <form id="recibir-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm space-y-1">
          <p className="font-medium text-foreground">{detalle.producto?.titulo ?? '—'}</p>
          <p className="text-muted-foreground">SKU: {detalle.producto?.sku ?? '—'}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Cantidad reportada
          </label>
          <input
            type="number"
            value={detalle.cantidadComprada}
            readOnly
            tabIndex={-1}
            className={`${FIELD} cursor-default opacity-60`}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Cantidad recibida <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={detalle.cantidadComprada}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className={FIELD}
          />
          {num > 0 && num <= detalle.cantidadComprada && (
            <p className="mt-1 text-xs text-muted-foreground">
              Estado resultante:{' '}
              <Badge variant={estadoVariant(estadoResultante)} className="text-[10px]">
                {estadoResultante}
              </Badge>
            </p>
          )}
        </div>
      </form>
    </FormModal>
  );
}

// ─── page content ─────────────────────────────────────────────────────────────

function EntregasContent() {
  const { data, isLoading, error } = useRecepciones({ limit: 200 });
  const cancelarMut = useCancelarRecepcion();

  const [search,     setSearch]     = useState('');
  const [filterTab,  setFilterTab]  = useState('todos');
  const [detalle,    setDetalle]    = useState<RecepcionInventario | null>(null);
  const [recibiendo, setRecibiendo] = useState<RecepcionInventario | null>(null);
  const [cancelando, setCancelando] = useState<RecepcionInventario | null>(null);
  const [notify,     setNotify]     = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const entregas = data?.data ?? [];

  const filtered = useMemo(() => {
    let list = entregas;
    if (filterTab !== 'todos') list = list.filter((r) => r.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        String(r.id).includes(q) ||
        (r.proveedor?.nombre ?? '').toLowerCase().includes(q) ||
        r.detalles.some((d) =>
          (d.producto?.titulo ?? '').toLowerCase().includes(q) ||
          (d.producto?.sku ?? '').toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }, [entregas, filterTab, search]);

  const tabCounts = useMemo(() => ({
    todos:     entregas.length,
    pendiente: entregas.filter((r) => r.estado === 'pendiente').length,
    recibida:  entregas.filter((r) => r.estado === 'recibida').length,
    parcial:   entregas.filter((r) => r.estado === 'parcial').length,
    cancelada: entregas.filter((r) => r.estado === 'cancelada').length,
  }), [entregas]);

  async function handleCancelar() {
    if (!cancelando) return;
    try {
      await cancelarMut.mutateAsync(cancelando.id);
      setCancelando(null);
      setNotify({ type: 'success', title: 'Entrega cancelada', message: `La entrega #${cancelando.id} fue cancelada.` });
    } catch (err: unknown) {
      setCancelando(null);
      setNotify({ type: 'error', title: 'Error al cancelar', message: (err as Error).message ?? 'No se pudo cancelar la entrega.' });
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (r: RecepcionInventario) => (
        <span className="font-mono text-xs text-muted-foreground">#{r.id}</span>
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
      key: 'proveedor',
      header: 'Proveedor',
      render: (r: RecepcionInventario) => (
        <span className="font-medium text-foreground">{r.proveedor?.nombre ?? '—'}</span>
      ),
    },
    {
      key: 'producto',
      header: 'Producto',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        return <span className="text-foreground">{d?.producto?.titulo ?? '—'}</span>;
      },
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        return <span className="font-mono text-xs text-muted-foreground">{d?.producto?.sku ?? '—'}</span>;
      },
    },
    {
      key: 'cantidadReportada',
      header: 'Cant. reportada',
      className: 'text-right',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        return <span className="tabular-nums text-foreground">{d?.cantidadComprada ?? '—'}</span>;
      },
    },
    {
      key: 'cantidadRecibida',
      header: 'Cant. recibida',
      className: 'text-right',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        if (!d) return <span className="text-muted-foreground">—</span>;
        const displayed =
          d.cantidadRecibida != null && d.cantidadRecibida > 0
            ? d.cantidadRecibida
            : r.estado === 'recibida'
            ? d.cantidadComprada
            : null;
        if (displayed == null) return <span className="text-muted-foreground">—</span>;
        return <span className="tabular-nums font-medium text-success">{displayed}</span>;
      },
    },
    {
      key: 'costoUnitario',
      header: 'Costo proveedor',
      className: 'text-right',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        return <span className="tabular-nums text-muted-foreground">{d ? fmtQ(d.costoUnitario) : '—'}</span>;
      },
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        if (!d) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="tabular-nums font-medium text-foreground">
            {fmtQ(d.cantidadComprada * d.costoUnitario)}
          </span>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (r: RecepcionInventario) => (
        <Badge variant={estadoVariant(r.estado)}>{r.estado}</Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (r: RecepcionInventario) => {
        const d = firstDetalle(r);
        return (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setDetalle(r)}
            >
              <Eye className="h-3 w-3" /> Ver
            </Button>
            {r.estado === 'pendiente' && d ? (
              <>
                <Button
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setRecibiendo(r)}
                >
                  <CheckCircle2 className="h-3 w-3" /> Recibir
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setCancelando(r)}
                  disabled={cancelarMut.isPending}
                >
                  <XCircle className="h-3 w-3" /> Cancelar
                </Button>
              </>
            ) : r.estado !== 'pendiente' ? (
              <Badge variant={estadoVariant(r.estado)}>
                {r.estado === 'recibida' ? 'Confirmado' : r.estado}
              </Badge>
            ) : null}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Entregas de proveedores"
          description="Revisa, confirma y administra las entregas registradas por proveedores."
          icon={<Truck className="h-5 w-5" />}
        />
        <LoadingState variant="table" label="Cargando entregas…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 sm:p-8">
        <ErrorState title="Error al cargar entregas" error={error} />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Entregas de proveedores"
        description="Revisa, confirma y administra las entregas registradas por proveedores."
        icon={<Truck className="h-5 w-5" />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={[
            { value: 'todos',     label: 'Todas',      count: tabCounts.todos     },
            { value: 'pendiente', label: 'Pendientes',  count: tabCounts.pendiente },
            { value: 'recibida',  label: 'Recibidas',   count: tabCounts.recibida  },
            { value: 'parcial',   label: 'Parciales',   count: tabCounts.parcial   },
            { value: 'cancelada', label: 'Canceladas',  count: tabCounts.cancelada },
          ]}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por proveedor, producto, SKU o ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            containerClassName="w-72"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'Sin entregas registradas'}
          description={
            search || filterTab !== 'todos'
              ? 'Ajusta la búsqueda o los filtros.'
              : 'Los proveedores aún no han registrado entregas.'
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

      {detalle && (
        <DetalleModal recepcion={detalle} onClose={() => setDetalle(null)} />
      )}

      {recibiendo && firstDetalle(recibiendo) && (
        <RecibirModal
          recepcion={recibiendo}
          detalle={firstDetalle(recibiendo)!}
          onClose={() => setRecibiendo(null)}
          onSuccess={(msg) => {
            setRecibiendo(null);
            setNotify({ type: 'success', title: 'Entrega recibida', message: msg });
          }}
        />
      )}

      <ConfirmDialog
        open={!!cancelando}
        title="¿Cancelar entrega?"
        description={
          cancelando
            ? `La entrega #${cancelando.id} de "${cancelando.proveedor?.nombre ?? '—'}" pasará a estado cancelada. No se modificará el stock.`
            : undefined
        }
        confirmLabel="Cancelar entrega"
        variant="danger"
        loading={cancelarMut.isPending}
        onConfirm={handleCancelar}
        onCancel={() => setCancelando(null)}
      />

    </main>
  );
}

export function EntregasPage() {
  return (
    <RoleGuard allowed={['admin']}>
      <EntregasContent />
    </RoleGuard>
  );
}

'use client';

import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  User,
  CreditCard,
  Calendar,
  Tag,
  Briefcase,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role-guard';
import { useVenta } from '@/hooks/use-ventas';
import { Badge }        from '@/components/ui/badge';
import { Button }       from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';

// ─── helpers ──────────────────────────────────────────────────────────────────

function estadoVariant(estado: string) {
  if (estado === 'completada') return 'success'  as const;
  if (estado === 'pendiente')  return 'warning'  as const;
  if (estado === 'cancelada')  return 'danger'   as const;
  return 'muted' as const;
}

function formatQ(n: number) {
  return `Q${n.toFixed(2)}`;
}

function fmtFecha(raw: string) {
  return String(raw).slice(0, 10);
}

// ─── page ─────────────────────────────────────────────────────────────────────

function VentaDetalleContent() {
  const params = useParams();
  const id = Number(params.id);

  const { data: venta, isLoading, error } = useVenta(id);

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando venta…" /></div>;
  if (error)     return <div className="p-8"><ErrorState title="Error al cargar la venta" error={error} /></div>;
  if (!venta)    return (
    <div className="p-8">
      <EmptyState
        title="Venta no encontrada"
        description="No existe ninguna venta con ese ID."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={"/dashboard/ventas" as any}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Volver a ventas
            </Link>
          </Button>
        }
      />
    </div>
  );

  const clienteNombre = venta.cliente
    ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
    : `Cliente #${venta.idCliente}`;

  const empleadoNombre = venta.empleado
    ? `${venta.empleado.nombre} ${venta.empleado.apellido}`
    : venta.idEmpleado
    ? `Empleado #${venta.idEmpleado}`
    : '—';

  const detalles = venta.detalles ?? [];
  const subtotal  = detalles.reduce((s, d) => s + d.precioUnitario * d.cantidadVendida, 0);
  const descMonto = venta.descuento ? subtotal * (venta.descuento / 100) : 0;
  const total     = subtotal - descMonto;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 gap-1.5 text-muted-foreground hover:text-foreground">
          <Link to={"/dashboard/ventas" as any}>
            <ArrowLeft className="h-4 w-4" />
            Volver a ventas
          </Link>
        </Button>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Venta <span className="font-mono text-brand">#{venta.id}</span>
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Detalle completo de la transacción
              </p>
            </div>
          </div>
          <Badge variant={estadoVariant(venta.estado)} className="mt-2 self-start sm:mt-0">
            {venta.estado}
          </Badge>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Fecha" value={fmtFecha(venta.fechaVenta)} />
        <InfoRow icon={<User className="h-4 w-4" />}     label="Cliente"   value={clienteNombre} />
        <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Empleado" value={empleadoNombre} />
        <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Método de pago" value={venta.metodoPago} capitalize />
        <InfoRow icon={<Tag className="h-4 w-4" />} label="Descuento"
          value={venta.descuento ? `${venta.descuento}%` : 'Sin descuento'} />
      </div>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {detalles.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin detalle de productos disponible.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Producto', 'Precio unit.', 'Cantidad', 'Subtotal'].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h !== 'Producto' ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, i) => {
                    const productoNombre = d.producto?.titulo ?? `Producto #${d.idProducto}`;
                    const linea = d.precioUnitario * d.cantidadVendida;
                    return (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{productoNombre}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{formatQ(d.precioUnitario)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{d.cantidadVendida}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">{formatQ(linea)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card className="ml-auto sm:max-w-xs">
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatQ(subtotal)}</span>
            </div>
            {descMonto > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Descuento ({venta.descuento}%)</span>
                <span className="tabular-nums text-danger">−{formatQ(descMonto)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatQ(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </main>
  );
}

// ─── InfoRow helper ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-0.5 text-sm font-medium text-foreground ${capitalize ? 'capitalize' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export function SaleDetailPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_ventas']}>
      <VentaDetalleContent />
    </RoleGuard>
  );
}

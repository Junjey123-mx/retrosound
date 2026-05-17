'use client';

import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Music2,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useMisOrden } from '@/hooks/use-mis-ordenes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

type BadgeVariant = 'warning' | 'success' | 'danger';

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  pendiente:  { label: 'Pendiente',  variant: 'warning' },
  completada: { label: 'Completada', variant: 'success' },
  cancelada:  { label: 'Cancelada',  variant: 'danger'  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatQ(value: number) {
  return `Q${Number(value).toFixed(2)}`;
}

export function OrderDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const { data: orden, isLoading, isError, error, refetch } = useMisOrden(id);

  if (isLoading) {
    return (
      <main className="rs-store-bg relative min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <LoadingState label="Cargando orden..." />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="rs-store-bg relative min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <ErrorState
            title="No se pudo cargar la orden"
            error={error}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Reintentar
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/mis-ordenes">Volver a mis órdenes</Link>
                </Button>
              </div>
            }
          />
        </div>
      </main>
    );
  }

  if (!orden) return null;

  const status = STATUS_CONFIG[orden.estadoVenta] ?? { label: orden.estadoVenta, variant: 'warning' as BadgeVariant };
  const recibo = orden.recibo;

  return (
    <main className="rs-store-bg relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-9 sm:px-6">
        <Link
          to="/mis-ordenes"
          className="rs-back-btn group mb-7 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Volver a mis órdenes
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pedido
            </p>
            <h1 className="text-4xl font-extrabold tracking-normal text-foreground">
              #{orden.idVenta}
            </h1>
          </div>
          <Badge variant={status.variant} className="text-sm px-4 py-1.5">
            {status.label}
          </Badge>
        </div>

        {/* Info general */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
              <ShoppingBag className="h-5 w-5 text-brand" />
              Información del pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Fecha</p>
                  <p className="text-sm font-bold text-foreground">{formatDate(orden.fechaVenta)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Método de pago</p>
                  <p className="text-sm font-bold text-foreground capitalize">{orden.metodoPago}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
              <Package className="h-5 w-5 text-brand" />
              Productos ({orden.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {orden.items.map((item, idx) => (
                <li key={idx} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                      <Music2 className="h-5 w-5 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{item.tituloProducto}</p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {item.formato}
                        {item.artistas?.length > 0 && ` · ${item.artistas.join(', ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-foreground">{formatQ(item.totalLinea)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.cantidad} × {formatQ(item.precioUnitario)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Resumen financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            {recibo ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatQ(recibo.subtotal)}</span>
                </div>
                {recibo.descuentoVenta > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                    <span>Descuento</span>
                    <span className="text-brand">-{formatQ(recibo.descuentoVenta)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>IVA 12%</span>
                  <span className="text-foreground">{formatQ(recibo.iva12)}</span>
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex items-end justify-between">
                  <span className="text-xl font-extrabold text-foreground">Total</span>
                  <span className="text-3xl font-extrabold text-brand">{formatQ(recibo.total)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <span className="text-xl font-extrabold text-foreground">Total</span>
                <span className="text-3xl font-extrabold text-brand">{formatQ(orden.total)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

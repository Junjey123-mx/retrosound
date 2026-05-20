import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Music2,
  Package,
  PackageSearch,
  ShoppingBag,
} from 'lucide-react';
import { useMisOrden } from '@/hooks/use-mis-ordenes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';

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

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo contra entrega',
};

export function CheckoutConfirmationPage() {
  const { pedidoId } = useParams<{ pedidoId?: string }>();
  const id = pedidoId ? Number(pedidoId) : NaN;
  const isValidId = !Number.isNaN(id) && id > 0;

  const { data: orden, isLoading, isError, error, refetch } = useMisOrden(isValidId ? id : 0);

  if (!isValidId) {
    return (
      <main className="rs-store-bg relative min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-16 sm:px-6">
          <EmptyState
            icon={<PackageSearch className="h-7 w-7" />}
            title="No hay confirmación disponible"
            description="Parece que llegaste aquí sin completar una compra."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="rs-btn-primary">
                  <Link to="/tienda">Ir a la tienda</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/mis-ordenes">Ver mis órdenes</Link>
                </Button>
              </div>
            }
          />
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="rs-store-bg relative min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-16 sm:px-6">
          <LoadingState label="Cargando confirmación del pedido..." />
        </div>
      </main>
    );
  }

  if (isError || !orden) {
    return (
      <main className="rs-store-bg relative min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-16 sm:px-6">
          <ErrorState
            title="No se pudo cargar el pedido"
            error={error}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Reintentar
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/mis-ordenes">Ver mis órdenes</Link>
                </Button>
              </div>
            }
          />
        </div>
      </main>
    );
  }

  const paymentLabel = PAYMENT_LABELS[orden.metodoPago] ?? orden.metodoPago;

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">

        {/* Encabezado de éxito */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-brand/30 bg-brand/10">
            <CheckCircle2 className="h-10 w-10 text-brand" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-normal text-foreground">
            Compra realizada correctamente
          </h1>
          <p className="mt-3 text-base font-semibold text-muted-foreground">
            Tu pedido fue registrado exitosamente.
          </p>
        </motion.div>

        {/* Resumen del pedido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                  <ShoppingBag className="h-5 w-5 text-brand" />
                  Pedido #{orden.idVenta}
                </CardTitle>
                <Badge variant="success">Confirmada</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Fecha</p>
                    <p className="text-sm font-bold text-foreground">{formatDate(orden.fechaVenta)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Método de pago</p>
                    <p className="text-sm font-bold text-foreground">{paymentLabel}</p>
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-border" />

              {/* Totales */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatQ(orden.totalNeto)}</span>
                </div>
                {orden.descuentoVenta > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                    <span>Descuento</span>
                    <span className="text-brand">-{formatQ(orden.descuentoVenta)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>IVA 12%</span>
                  <span className="text-foreground">{formatQ(orden.iva)}</span>
                </div>
                <div className="my-2 h-px bg-border" />
                <div className="flex items-end justify-between">
                  <span className="text-lg font-extrabold text-foreground">Total pagado</span>
                  <span className="text-3xl font-extrabold text-brand">{formatQ(orden.totalConIva)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productos comprados */}
        {orden.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.12 }}
          >
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
                    <li key={idx} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                          {item.imagenUrl ? (
                            <img src={item.imagenUrl} alt={item.tituloProducto} className="h-full w-full object-cover" />
                          ) : (
                            <Music2 className="h-4 w-4 text-brand" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-bold text-foreground">{item.tituloProducto}</p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                            x{item.cantidad} · {formatQ(item.precioUnitario)} c/u
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-foreground">{formatQ(item.totalLinea)}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button asChild className="rs-btn-primary">
            <Link to={`/mis-ordenes/${orden.idVenta}`}>
              <ArrowLeft className="mr-1 h-4 w-4 rotate-180" />
              Ver mi pedido
            </Link>
          </Button>
          <Button asChild variant="outline" className="dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:border-slate-400 dark:hover:bg-slate-800">
            <Link to="/tienda">Volver a la tienda</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
            <Link to="/mis-ordenes">Ver todas mis órdenes</Link>
          </Button>
        </motion.div>

      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Music2,
  PackageSearch,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import type { CheckoutResponse } from '@/lib/services/checkout';

const CHECKOUT_KEY = 'rs-checkout-result';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatQ(value: number) {
  return `Q${value.toFixed(2)}`;
}

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo contra entrega',
};

export function CheckoutConfirmationPage() {
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(CHECKOUT_KEY);
      if (stored) {
        setResult(JSON.parse(stored) as CheckoutResponse);
        sessionStorage.removeItem(CHECKOUT_KEY);
      }
    } catch {
      // ignore
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!result) {
    return (
      <main className="rs-store-bg relative min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-16 sm:px-6">
          <EmptyState
            icon={<PackageSearch className="h-7 w-7" />}
            title="No hay confirmación disponible"
            description="Parece que llegaste aquí sin completar una compra."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/tienda">Ir a la tienda</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/mis-ordenes">Ver mis órdenes</Link>
                </Button>
              </div>
            }
          />
        </div>
      </main>
    );
  }

  const { venta } = result;
  const { recibo } = venta;
  const paymentLabel = PAYMENT_LABELS[venta.metodoPago] ?? venta.metodoPago;

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-brand/30 bg-brand/10">
            <CheckCircle2 className="h-10 w-10 text-brand" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-normal text-foreground">
            ¡Compra confirmada!
          </h1>
          <p className="mt-3 text-base font-semibold text-muted-foreground">
            Tu pedido fue registrado exitosamente en RetroSound.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                <ShoppingBag className="h-5 w-5 text-brand" />
                Pedido #{venta.idVenta}
              </CardTitle>
              <Badge variant="success">Confirmada</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                <Calendar className="h-4 w-4 text-brand" />
                <span>Fecha: <span className="text-foreground">{formatDate(new Date().toISOString())}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                <CreditCard className="h-4 w-4 text-brand" />
                <span>Método de pago: <span className="text-foreground">{paymentLabel}</span></span>
              </div>
            </div>

            {recibo && (
              <>
                <div className="my-5 h-px bg-border" />
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
                    <span className="text-lg font-extrabold text-foreground">Total pagado</span>
                    <span className="text-3xl font-extrabold text-brand">{formatQ(recibo.total)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="rs-store-surface rounded-[18px] border p-5 text-center">
          <Music2 className="mx-auto mb-3 h-7 w-7 text-brand" />
          <p className="text-sm font-semibold text-muted-foreground">
            Pronto recibirás más detalles sobre tu pedido.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link to="/mis-ordenes">Ver mis órdenes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/tienda">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

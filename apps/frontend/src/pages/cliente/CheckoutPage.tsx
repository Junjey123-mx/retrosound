'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CreditCard,
  Lock,
  MapPin,
  Music2,
  Package,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCarrito } from '@/hooks/use-carrito';
import { useCheckout } from '@/hooks/use-checkout';
import { useClienteMe } from '@/hooks/use-clientes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { NotifyModal } from '@/components/ui/notify-modal';
import type { CheckoutResponse } from '@/lib/services/checkout';

type PaymentMethod = 'tarjeta' | 'transferencia' | 'efectivo';

const PAYMENT_OPTIONS: { key: PaymentMethod; title: string; description: string; Icon: LucideIcon }[] = [
  { key: 'tarjeta',       title: 'Tarjeta',                  description: 'Visa, Mastercard, etc.',     Icon: CreditCard       },
  { key: 'transferencia', title: 'Transferencia',            description: 'Depósito bancario',           Icon: BriefcaseBusiness },
  { key: 'efectivo',      title: 'Efectivo contra entrega',  description: 'Paga al recibir tu pedido',  Icon: Banknote          },
];

const CHECKOUT_KEY = 'rs-checkout-result';

function formatQ(value: number) {
  return `Q${value.toFixed(2)}`;
}

function saveCheckoutResult(response: CheckoutResponse) {
  try {
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(response));
  } catch {
    // ignore storage errors
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: carrito, isLoading: carritoLoading, isError: carritoError } = useCarrito();
  const { data: cliente } = useClienteMe();
  const checkout = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const items = carrito?.items ?? [];
  const subtotal = carrito?.subtotal ?? 0;
  const discount = subtotal >= 30 ? 30 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const iva = taxable * 0.12;
  const total = taxable + iva;
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);

  const handleConfirm = async () => {
    if (items.length === 0) {
      setNotify({ type: 'error', title: 'Carrito vacío', message: 'Agrega productos antes de confirmar.' });
      return;
    }
    try {
      const response = await checkout.mutateAsync({ metodoPago: paymentMethod, descuento: discount });
      saveCheckoutResult(response);
      navigate('/checkout/confirmacion' as any);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? '';
      const isStock = msg.toLowerCase().includes('stock') || msg.toLowerCase().includes('insuficiente');
      setNotify({
        type: 'error',
        title: isStock ? 'Stock insuficiente' : 'No se pudo confirmar',
        message: isStock
          ? 'Uno o más productos no tienen stock suficiente. Revisa tu carrito.'
          : msg || 'Intenta de nuevo en unos segundos.',
      });
    }
  };

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6">
        <Link
          to="/carrito"
          className="rs-back-btn group mb-7 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Volver al carrito
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-base font-semibold text-muted-foreground">
            Confirma el método de pago para completar tu pedido.
          </p>
        </div>

        {carritoLoading && <LoadingState label="Cargando información..." />}

        {carritoError && (
          <ErrorState
            title="No se pudo cargar el carrito"
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/carrito">Volver al carrito</Link>
              </Button>
            }
          />
        )}

        {!carritoLoading && !carritoError && (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.46fr]">
            <div className="space-y-6">
              {/* Productos */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="rs-store-surface rounded-[18px] border p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-extrabold text-foreground">Productos</h2>
                </div>

                {items.length === 0 ? (
                  <EmptyState
                    icon={<Package className="h-7 w-7" />}
                    title="Carrito vacío"
                    description="Regresa a la tienda para agregar productos."
                    action={
                      <Button asChild variant="outline" size="sm">
                        <Link to="/tienda">Ir a la tienda</Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {items.map((item) => (
                      <li key={item.idCarritoItem} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                          <Music2 className="h-5 w-5 text-brand" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-bold text-foreground">{item.titulo}</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            x{item.cantidad} · {formatQ(item.precioUnitarioSnapshot)} c/u
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-foreground">{formatQ(item.subtotal)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>

              {/* Datos de entrega (readonly desde perfil) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 }}
                className="rs-store-surface rounded-[18px] border p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-extrabold text-foreground">Datos de entrega</h2>
                </div>

                {cliente ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      value={`${cliente.nombre} ${cliente.apellido}`}
                      readOnly
                      className="bg-muted/40"
                    />
                    <Input
                      label="Teléfono"
                      value={cliente.telefono ?? '—'}
                      readOnly
                      className="bg-muted/40"
                    />
                    <Input
                      label="Dirección"
                      value={cliente.direccion ?? '—'}
                      readOnly
                      className="bg-muted/40 sm:col-span-2"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    La entrega se coordina según tu perfil de cliente.{' '}
                    <Link to="/perfil" className="text-brand underline-offset-2 hover:underline">
                      Actualizar perfil
                    </Link>
                  </p>
                )}
              </motion.section>

              {/* Método de pago */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.10 }}
                className="rs-store-surface rounded-[18px] border p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-brand" />
                  <h2 className="text-xl font-extrabold text-foreground">Método de pago</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {PAYMENT_OPTIONS.map(({ key, title, description, Icon }) => {
                    const active = paymentMethod === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPaymentMethod(key)}
                        className={`flex w-full flex-col gap-4 rounded-[14px] p-5 text-left transition ${
                          active ? 'rs-payment-option-active' : 'rs-payment-option'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon
                            className="h-6 w-6 transition-colors"
                            style={{ color: active ? 'hsl(var(--brand))' : undefined }}
                          />
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                            style={{ borderColor: active ? 'hsl(var(--brand))' : 'hsl(var(--muted-foreground) / 0.4)' }}
                          >
                            {active && (
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: 'hsl(var(--brand))' }}
                              />
                            )}
                          </span>
                        </div>
                        <div>
                          <span
                            className="block text-sm font-bold transition-colors"
                            style={{ color: active ? 'hsl(var(--brand))' : undefined }}
                          >
                            {title}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            </div>

            {/* Resumen */}
            <motion.aside
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="rs-store-surface h-fit rounded-[18px] border p-6 lg:sticky lg:top-28"
            >
              <div className="mb-6 flex items-center gap-3">
                <ShoppingBag className="h-7 w-7 text-brand" />
                <h2 className="text-xl font-extrabold text-foreground">Resumen</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>Subtotal ({itemCount} productos)</span>
                  <span className="text-foreground">{formatQ(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                    <span>Descuento</span>
                    <span className="text-brand">-{formatQ(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>IVA 12%</span>
                  <span className="text-foreground">{formatQ(iva)}</span>
                </div>
              </div>

              <div className="my-5 h-px bg-border" />

              <div className="mb-6 flex items-end justify-between">
                <span className="text-xl font-extrabold text-foreground">Total</span>
                <span className="text-3xl font-extrabold text-brand">{formatQ(total)}</span>
              </div>

              <Button
                className="rs-checkout-btn"
                disabled={items.length === 0 || checkout.isPending}
                loading={checkout.isPending}
                onClick={handleConfirm}
              >
                {!checkout.isPending && <Lock className="h-5 w-5" />}
                {checkout.isPending ? 'Confirmando…' : 'Confirmar compra'}
              </Button>
            </motion.aside>
          </div>
        )}
      </div>

      {notify && (
        <NotifyModal
          type={notify.type}
          title={notify.title}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}
    </main>
  );
}

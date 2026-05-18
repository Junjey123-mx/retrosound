'use client';

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeDollarSign,
  Minus,
  Music2,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useCarrito, useRemoveFromCarrito, useUpdateCarritoItem, useCancelarCarrito } from '@/hooks/use-carrito';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import type { CarritoItem } from '@/lib/services/carrito';

function formatQ(value: number) {
  return `Q${value.toFixed(2)}`;
}

function ItemRow({ item }: { item: CarritoItem }) {
  const remove = useRemoveFromCarrito();
  const update = useUpdateCarritoItem();

  return (
    <li className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
        <Music2 className="h-7 w-7 text-brand" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-bold text-foreground">{item.titulo}</p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {formatQ(item.precioUnitarioSnapshot)} c/u
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="inline-flex overflow-hidden rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => {
              if (item.cantidad > 1) update.mutate({ idCarritoItem: item.idCarritoItem, cantidad: item.cantidad - 1 });
            }}
            disabled={item.cantidad <= 1 || update.isPending}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Disminuir"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm font-bold text-foreground">
            {item.cantidad}
          </span>
          <button
            type="button"
            onClick={() => update.mutate({ idCarritoItem: item.idCarritoItem, cantidad: item.cantidad + 1 })}
            disabled={item.cantidad >= item.stockActual || update.isPending}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label="Aumentar"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="w-20 text-right text-sm font-bold text-foreground">
          {formatQ(item.subtotal)}
        </p>

        <button
          type="button"
          onClick={() => remove.mutate(item.idCarritoItem)}
          disabled={remove.isPending}
          className="rs-btn-danger inline-flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-40"
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { data: carrito, isLoading, isError, refetch } = useCarrito();
  const cancelar = useCancelarCarrito();

  const items = carrito?.items ?? [];
  const subtotal = carrito?.subtotal ?? 0;
  const discount = subtotal >= 30 ? 30 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const iva = taxable * 0.12;
  const total = taxable + iva;
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6">
        <Link
          to="/tienda"
          className="rs-back-btn group mb-7 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Regresar a la tienda
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">
              Carrito
            </h1>
            <p className="mt-2 text-base font-semibold text-muted-foreground">
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelar.mutate()}
              loading={cancelar.isPending}
              className="text-destructive hover:text-destructive"
            >
              Vaciar carrito
            </Button>
          )}
        </div>

        {isLoading && <LoadingState label="Cargando carrito..." />}

        {isError && (
          <ErrorState
            title="No se pudo cargar el carrito"
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          />
        )}

        {!isLoading && !isError && (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.46fr]">
            <div>
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingCart className="h-7 w-7" />}
                  title="Tu carrito está vacío"
                  description="Explora el catálogo y agrega productos para comenzar."
                  action={
                    <Button asChild variant="outline" size="sm">
                      <Link to="/tienda">Ir a la tienda</Link>
                    </Button>
                  }
                />
              ) : (
                <Card>
                  <div className="mb-4 flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 text-brand" />
                    <h2 className="text-xl font-extrabold text-foreground">
                      Productos ({itemCount})
                    </h2>
                  </div>
                  <ul className="divide-y divide-border">
                    {items.map((item) => (
                      <ItemRow key={item.idCarritoItem} item={item} />
                    ))}
                  </ul>
                </Card>
              )}
            </div>

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
                disabled={items.length === 0}
                onClick={() => navigate('/checkout' as any)}
              >
                Finalizar compra
              </Button>

              <Button asChild variant="outline" className="mt-3 w-full dark:bg-transparent dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-800">
                <Link to="/tienda">Seguir comprando</Link>
              </Button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  Pago seguro protegido
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <BadgeDollarSign className="h-5 w-5 text-brand" />
                  El stock se confirma al finalizar.
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </div>
    </main>
  );
}

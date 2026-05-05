'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  CreditCard,
  FilePenLine,
  Lock,
  Music2,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCarrito, useRemoveFromCarrito } from '@/hooks/use-carrito';
import { useCheckout } from '@/hooks/use-checkout';
import { useClienteProductos } from '@/hooks/use-productos';
import { useCurrentUser } from '@/hooks/use-auth';
import { NotifyModal } from '@/components/ui/notify-modal';
import type { Producto } from '@/types';
import type { CarritoItem } from '@/lib/services/carrito';

type PaymentMethod = 'tarjeta' | 'transferencia' | 'efectivo';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  { key: 'tarjeta', title: 'Tarjeta', description: 'Visa, Mastercard, etc.', Icon: CreditCard },
  { key: 'transferencia', title: 'Transferencia', description: 'Depósito bancario', Icon: BriefcaseBusiness },
  { key: 'efectivo', title: 'Efectivo contra entrega', description: 'Paga al recibir tu pedido', Icon: Banknote },
];

function StoreDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-brand">
      <svg
        aria-hidden="true"
        className="absolute -left-44 top-16 h-80 w-[560px] opacity-[0.10] dark:opacity-[0.14]"
        viewBox="0 0 560 320"
        fill="none"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <path
            key={index}
            d={`M0 ${58 + index * 17} C 126 ${22 + index * 10}, 218 ${268 - index * 10}, 560 ${186 - index * 12}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
      <svg
        aria-hidden="true"
        className="absolute -right-44 top-28 h-80 w-[560px] opacity-[0.10] dark:opacity-[0.16]"
        viewBox="0 0 560 320"
        fill="none"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <path
            key={index}
            d={`M18 ${252 - index * 16} C 158 ${122 + index * 4}, 330 ${210 - index * 18}, 560 ${42 + index * 14}`}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
      <Music2 className="absolute right-[8%] top-28 h-20 w-20 rotate-12 opacity-[0.10]" />
      <Music2 className="absolute right-[15%] top-40 h-9 w-9 -rotate-6 opacity-[0.10]" />
      <div className="absolute -left-24 bottom-28 h-56 w-56 rounded-full border-[28px] border-current opacity-[0.05]" />
      <div className="absolute -right-20 bottom-24 h-56 w-56 rounded-full border-[24px] border-current opacity-[0.07]" />
    </div>
  );
}

function formatQ(value: number) {
  return `Q${value.toFixed(2)}`;
}

function getItemArtwork(item: CarritoItem, product?: Producto) {
  return product?.imagenUrl ?? product?.imagen;
}

function CartItemThumb({ item, product }: { item: CarritoItem; product?: Producto }) {
  const image = getItemArtwork(item, product);

  if (image) {
    return (
      <img
        src={image}
        alt={item.titulo}
        className="h-full w-full rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
      <Music2 className="h-8 w-8 text-brand" />
    </div>
  );
}

function SectionCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rs-store-surface rounded-[18px] border p-6"
    >
      <div className="mb-6 flex items-center gap-4">
        <Icon className="h-7 w-7 text-brand" />
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-bold text-muted-foreground">
        {label} <span className="text-destructive">*</span>
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`rs-store-control h-14 w-full rounded-xl border px-4 text-base font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 ${
          error
            ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
            : 'focus:border-brand focus:ring-brand/20'
        }`}
      />
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </label>
  );
}

type FormErrors = Partial<Record<'nombre' | 'telefono' | 'direccion' | 'correo' | 'note', string>>;

function validateForm(
  delivery: { nombre: string; telefono: string; direccion: string; correo: string },
  note: string,
): FormErrors {
  const e: FormErrors = {};
  if (!delivery.nombre.trim())    e.nombre    = 'El nombre es requerido.';
  if (!delivery.telefono.trim())  e.telefono  = 'El teléfono es requerido.';
  if (!delivery.direccion.trim()) e.direccion = 'La dirección es requerida.';
  if (!delivery.correo.trim())    e.correo    = 'El correo es requerido.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.correo))
    e.correo = 'Ingresa un correo válido.';
  if (!note.trim()) e.note = 'Las notas del pedido son requeridas.';
  return e;
}

export default function CarritoPage() {
  const user = useCurrentUser();
  const { data: carrito, isLoading, isError, refetch } = useCarrito();
  const { data: productos } = useClienteProductos();
  const checkout = useCheckout();
  const removeFromCarrito = useRemoveFromCarrito();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [delivery, setDelivery] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    correo: user?.correo ?? '',
  });

  useEffect(() => {
    if (!user?.correo) return;
    setDelivery((current) => current.correo ? current : { ...current, correo: user.correo });
  }, [user?.correo]);

  const productById = useMemo(() => {
    return new Map((productos ?? []).map((product) => [product.id, product]));
  }, [productos]);

  const items = carrito?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = carrito?.subtotal ?? 0;
  const discount = subtotal >= 30 ? 30 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const iva = taxable * 0.12;
  const total = taxable + iva;

  const setDeliveryField = (key: keyof typeof delivery, value: string) => {
    setDelivery((current) => ({ ...current, [key]: value }));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setNotify({ type: 'error', title: 'Tu carrito está vacío', message: 'Agrega productos antes de confirmar la compra.' });
      return;
    }

    const errors = validateForm(delivery, note);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setNotify({ type: 'error', title: 'Formulario incompleto', message: 'Completa todos los campos requeridos.' });
      return;
    }
    setFormErrors({});

    try {
      await checkout.mutateAsync({ metodoPago: paymentMethod, descuento: discount });
      setNotify({ type: 'success', title: 'Compra confirmada', message: 'Tu pedido se registró correctamente.' });
    } catch (error: unknown) {
      setNotify({ type: 'error', title: 'No se pudo confirmar la compra', message: (error as Error).message ?? 'Intenta de nuevo en unos segundos.' });
    }
  };

  const clearError = (field: keyof FormErrors) =>
    setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <StoreDecor />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6">
        <Link
          href="/tienda"
          className="rs-back-btn group mb-7 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Regresar a la tienda
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-normal text-foreground sm:text-5xl">
            Finalizar compra
          </h1>
          <p className="mt-4 text-lg font-semibold text-muted-foreground">
            Confirma tus datos y el método de pago para completar tu pedido.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.48fr]">
          <div className="space-y-6">
            {/* ── Lista de productos a comprar ─────────────────────────── */}
            <SectionCard title="Lista de productos a comprar" Icon={ShoppingCart}>
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              )}
              {!isLoading && items.length === 0 && (
                <div className="rounded-xl border border-border p-6 text-center">
                  <Package className="mx-auto h-8 w-8 text-brand" />
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">Tu carrito está vacío.</p>
                  <Link href="/tienda" className="rs-back-btn mt-3 inline-block text-sm font-bold">
                    Ir a la tienda
                  </Link>
                </div>
              )}
              {!isLoading && items.length > 0 && (
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const product = productById.get(item.idProducto);
                    const image = product?.imagenUrl ?? product?.imagen;
                    return (
                      <li key={item.idCarritoItem} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {image ? (
                            <img src={image} alt={item.titulo} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music2 className="h-6 w-6 text-brand" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-bold text-foreground">{item.titulo}</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            x{item.cantidad} · {formatQ(item.subtotal)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCarrito.mutate(item.idCarritoItem)}
                          disabled={removeFromCarrito.isPending}
                          className="rs-btn-danger inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-40"
                          title="Quitar del carrito"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Datos de entrega" Icon={UserRound}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Nombre completo"
                  value={delivery.nombre}
                  onChange={(value) => { setDeliveryField('nombre', value); clearError('nombre'); }}
                  placeholder="Juan Pablo Ramírez"
                  error={formErrors.nombre}
                />
                <Field
                  label="Teléfono"
                  value={delivery.telefono}
                  onChange={(value) => { setDeliveryField('telefono', value); clearError('telefono'); }}
                  placeholder="+502 5678 9012"
                  error={formErrors.telefono}
                />
                <Field
                  label="Dirección"
                  value={delivery.direccion}
                  onChange={(value) => { setDeliveryField('direccion', value); clearError('direccion'); }}
                  placeholder="12 Avenida 5-45, Zona 10, Ciudad de Guatemala"
                  error={formErrors.direccion}
                />
                <Field
                  label="Correo electrónico"
                  type="email"
                  value={delivery.correo}
                  onChange={(value) => { setDeliveryField('correo', value); clearError('correo'); }}
                  placeholder="juanpablo.ramirez@mail.com"
                  error={formErrors.correo}
                />
              </div>
            </SectionCard>

            <SectionCard title="Método de pago" Icon={CreditCard}>
              <div className="grid gap-4 md:grid-cols-3">
                {PAYMENT_OPTIONS.map(({ key, title, description, Icon }) => {
                  const active = paymentMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`flex w-full flex-col gap-4 rounded-[14px] p-5 text-left ${
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
            </SectionCard>

            <SectionCard title="Notas del pedido" Icon={FilePenLine}>
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-muted-foreground">
                  Nota para el pedido <span className="text-destructive">*</span>
                </span>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(event) => { setNote(event.target.value.slice(0, 250)); clearError('note'); }}
                    placeholder="Instrucciones de entrega, referencias, horario preferido..."
                    className={`rs-store-control min-h-32 w-full resize-none rounded-xl border p-4 pr-16 text-base font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 ${
                      formErrors.note
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'focus:border-brand focus:ring-brand/20'
                    }`}
                  />
                  <span className="absolute bottom-4 right-4 text-sm font-bold text-muted-foreground">
                    {note.length}/250
                  </span>
                </div>
                {formErrors.note && (
                  <p className="text-xs font-semibold text-destructive">{formErrors.note}</p>
                )}
              </div>
            </SectionCard>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="rs-store-surface h-fit rounded-[18px] border p-6 lg:sticky lg:top-28 dark:border-brand/40 dark:shadow-[0_0_34px_rgba(var(--brand-shadow-rgb),0.12)]"
          >
            <div className="mb-7 flex items-center gap-4">
              <ShoppingBag className="h-9 w-9 text-brand" />
              <h2 className="text-2xl font-extrabold text-foreground">Resumen de compra</h2>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-border p-5 text-center">
                <p className="text-sm font-bold text-foreground">No se pudo cargar el carrito.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white dark:text-primary-foreground"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <div className="rounded-xl border border-border p-6 text-center">
                <Package className="mx-auto h-10 w-10 text-brand" />
                <p className="mt-3 text-sm font-bold text-foreground">Tu carrito está vacío.</p>
                <Link href="/tienda" className="mt-4 inline-flex text-sm font-bold text-brand">
                  Ir a tienda
                </Link>
              </div>
            )}

            {!isLoading && !isError && items.length > 0 && (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.idCarritoItem} className="grid grid-cols-[72px_1fr_auto] items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-lg border border-border">
                        <CartItemThumb item={item} product={productById.get(item.idProducto)} />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-extrabold text-foreground">{item.titulo}</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">x{item.cantidad}</p>
                      </div>
                      <p className="text-sm font-extrabold text-foreground">
                        {formatQ(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-7 h-px bg-border" />

                <div className="space-y-5">
                  <div className="flex justify-between text-base font-semibold text-muted-foreground">
                    <span>Subtotal ({itemCount} productos)</span>
                    <span className="text-foreground">{formatQ(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-muted-foreground">
                    <span>Descuento</span>
                    <span className="text-brand">-{formatQ(discount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-muted-foreground">
                    <span>IVA 12%</span>
                    <span className="text-foreground">{formatQ(iva)}</span>
                  </div>
                </div>

                <div className="my-7 h-px bg-border" />

                <div className="mb-7 flex items-end justify-between">
                  <span className="text-2xl font-extrabold text-foreground">Total</span>
                  <span className="text-4xl font-extrabold text-brand">{formatQ(total)}</span>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkout.isPending || items.length === 0}
              className="rs-checkout-btn"
            >
              <Lock className="h-5 w-5" />
              {checkout.isPending ? 'Confirmando…' : 'Confirmar compra'}
            </button>

            <div className="mt-7 space-y-5">
              <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                <ShieldCheck className="h-7 w-7 text-brand" />
                Pago seguro protegido
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                <BadgeDollarSign className="h-7 w-7 text-brand" />
                El stock se confirma al finalizar la compra.
              </div>
            </div>
          </motion.aside>
        </div>
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

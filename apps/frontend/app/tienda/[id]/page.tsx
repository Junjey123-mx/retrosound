'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Disc3,
  FileText,
  Lock,
  Minus,
  Music2,
  Package,
  Plus,
  Radio,
  Shield,
  ShoppingCart,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClienteProducto } from '@/hooks/use-productos';
import { useAddToCarrito } from '@/hooks/use-carrito';
import { NotifyModal } from '@/components/ui/notify-modal';
import type { Producto } from '@/types';

const FORMAT_CONFIG = {
  vinilo: { label: 'Vinilo', Icon: Disc3 },
  cd: { label: 'CD', Icon: Music2 },
  casete: { label: 'Casete', Icon: Radio },
} as const;

type StatusKind = 'available' | 'low' | 'out';

function normalize(value?: string) {
  return value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getFormat(nombre?: string) {
  const key = normalize(nombre) as keyof typeof FORMAT_CONFIG | undefined;
  return key && FORMAT_CONFIG[key] ? FORMAT_CONFIG[key] : FORMAT_CONFIG.vinilo;
}

function getArtists(producto: Producto) {
  return producto.artistas?.map((item) => item.artista.nombre).filter(Boolean).join(', ') ?? '';
}

function getGenres(producto: Producto) {
  return producto.generos?.map((item) => item.generoMusical.nombre).filter(Boolean).join(', ') ?? '';
}

function getStatus(producto: Producto): { kind: StatusKind; label: string } {
  const out = producto.estado === 'agotado' || producto.estado !== 'activo' || producto.stockActual <= 0;
  const low = !out && producto.stockMinimo > 0 && producto.stockActual <= producto.stockMinimo * 1.5;

  if (out) return { kind: 'out', label: 'Agotado' };
  if (low) return { kind: 'low', label: 'Stock bajo' };
  return { kind: 'available', label: 'Disponible' };
}

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

function ProductArtwork({ producto }: { producto: Producto }) {
  const image = producto.imagenUrl ?? producto.imagen;
  const fmt = getFormat(producto.formato?.nombre);

  if (image) {
    return (
      <img
        src={image}
        alt={producto.titulo}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-[360px] items-center justify-center overflow-hidden bg-muted">
      <div className="absolute right-[9%] top-1/2 aspect-square w-[42%] -translate-y-1/2 rounded-full border-[34px] border-foreground/90 bg-background shadow-2xl">
        <div className="absolute inset-5 rounded-full border border-background/30" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card" />
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
      </div>

      <div className="relative z-10 aspect-square w-[58%] min-w-64 rounded-sm border border-border bg-card p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--brand)/0.16),transparent_32%)]" />
        <div className="relative flex h-full flex-col items-center justify-center text-center">
          <fmt.Icon className="mb-5 h-20 w-20 text-brand" />
          <p className="line-clamp-2 text-lg font-extrabold text-foreground">{producto.titulo}</p>
          {getArtists(producto) && (
            <p className="mt-2 line-clamp-1 text-sm font-semibold text-muted-foreground">{getArtists(producto)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusLine({ status, stock }: { status: ReturnType<typeof getStatus>; stock: number }) {
  if (status.kind === 'out') {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-destructive">
        <XCircle className="h-4 w-4" />
        <span>Agotado</span>
        <span className="text-muted-foreground">• Stock: {stock}</span>
      </div>
    );
  }

  if (status.kind === 'low') {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--warning))]">
        <TriangleAlert className="h-4 w-4" />
        <span>Stock bajo</span>
        <span className="text-muted-foreground">• Stock: {stock}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-brand">
      <CheckCircle2 className="h-4 w-4" />
      <span>Disponible</span>
      <span className="text-muted-foreground">• Stock: {stock}</span>
    </div>
  );
}

function MiniCard({
  Icon,
  label,
  value,
  status,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  status?: StatusKind;
}) {
  const statusClass =
    status === 'out'
      ? 'text-destructive'
      : status === 'low'
        ? 'text-[hsl(var(--warning))]'
        : 'text-brand';

  return (
    <div className="rs-store-card flex min-h-24 items-center gap-4 rounded-[16px] border p-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-current ${statusClass}`}
        style={{ backgroundColor: 'hsl(var(--brand) / 0.07)' }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className={`mt-1 truncate text-base font-extrabold ${status ? statusClass : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SpecsCard({
  producto,
  formatLabel,
  status,
  genres,
}: {
  producto: Producto;
  formatLabel: string;
  status: ReturnType<typeof getStatus>;
  genres: string;
}) {
  const specs = [
    { label: 'SKU', value: producto.codigoSku },
    { label: 'Categoría', value: producto.categoria?.nombre },
    { label: 'Año de lanzamiento', value: producto.anioLanzamiento?.toString() },
    { label: 'Géneros', value: genres || 'Varios' },
    { label: 'Formato', value: formatLabel },
    { label: 'Estado', value: status.label, status: status.kind },
  ];

  return (
    <section className="rs-store-surface rounded-[18px] border p-6">
      <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
        <FileText className="h-7 w-7 text-brand" />
        <h2 className="text-xl font-extrabold text-foreground">Especificaciones</h2>
      </div>

      <dl className="grid gap-x-9 gap-y-5 sm:grid-cols-2">
        {specs.map((item) => (
          <div key={item.label} className="grid grid-cols-[minmax(130px,0.8fr)_1fr] items-start gap-4">
            <dt className="flex items-center gap-3 text-sm font-bold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {item.label}
            </dt>
            <dd
              className={`text-sm font-semibold ${
                item.status === 'out'
                  ? 'text-destructive'
                  : item.status === 'low'
                    ? 'text-[hsl(var(--warning))]'
                    : item.status === 'available'
                      ? 'text-brand'
                      : 'text-muted-foreground'
              }`}
            >
              {item.value ?? 'No disponible'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TrustCard() {
  const items = [
    {
      Icon: Package,
      title: 'Stock actualizado',
      text: 'Información en tiempo real para que compres con total confianza.',
    },
    {
      Icon: Activity,
      title: 'Producto revisado',
      text: 'Cada pieza es revisada y probada para garantizar su calidad.',
    },
    {
      Icon: Lock,
      title: 'Compra segura',
      text: 'Tus datos y pagos están protegidos con los más altos estándares.',
    },
  ];

  return (
    <section className="rs-store-surface rounded-[18px] border p-6">
      <div className="mb-8 flex items-center gap-4">
        <Shield className="h-7 w-7 text-brand" />
        <h2 className="text-xl font-extrabold text-foreground">Compra con confianza</h2>
      </div>

      <div className="grid gap-7 sm:grid-cols-3">
        {items.map(({ Icon, title, text }) => (
          <div key={title}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[16px] border border-border bg-card text-brand shadow-sm">
              <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">{title}</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.04fr]">
        <div className="space-y-5">
          <div className="aspect-[1.55/1] min-h-[360px] animate-pulse rounded-[18px] bg-muted" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[16px] bg-muted" />
            ))}
          </div>
        </div>
        <div className="min-h-[520px] animate-pulse rounded-[18px] bg-muted" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[18px] bg-muted" />
        <div className="h-64 animate-pulse rounded-[18px] bg-muted" />
      </div>
    </main>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = use(params);
  const id = Number(idParam);
  const { data: producto, isLoading, isError, error, refetch } = useClienteProducto(id);
  const addToCarrito = useAddToCarrito();
  const [quantity, setQuantity] = useState(1);
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (producto) setQuantity(1);
  }, [producto?.id]);

  const productState = useMemo(() => (producto ? getStatus(producto) : null), [producto]);

  if (isLoading) return <DetailSkeleton />;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
  const isNotFound = errorMessage.includes('no encontrado') || errorMessage.includes('404');

  if (isError && !isNotFound) {
    return (
      <main className="rs-store-bg relative min-h-[70vh] overflow-hidden px-4 py-16 sm:px-6">
        <StoreDecor />
        <div className="rs-store-surface relative z-10 mx-auto max-w-xl rounded-[18px] border p-10 text-center">
          <Music2 className="mx-auto h-12 w-12 text-brand" />
          <p className="mt-4 text-xl font-extrabold text-foreground">No se pudo cargar el producto.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tienda"
              className="rs-back-btn inline-flex items-center gap-1.5 rounded-xl border px-5 py-2.5 text-sm font-bold"
              style={{ borderColor: 'hsl(var(--brand) / 0.45)' }}
            >
              <ArrowLeft className="h-4 w-4" /> Volver a tienda
            </Link>
            <button
              type="button"
              onClick={() => refetch()}
              className="rs-btn-new rounded-xl px-5 py-2.5 text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isNotFound || !producto || !productState) {
    return (
      <main className="rs-store-bg relative min-h-[70vh] overflow-hidden px-4 py-16 sm:px-6">
        <StoreDecor />
        <div className="rs-store-surface relative z-10 mx-auto max-w-xl rounded-[18px] border p-10 text-center">
          <Music2 className="mx-auto h-12 w-12 text-brand" />
          <p className="mt-4 text-xl font-extrabold text-foreground">Producto no encontrado</p>
          <Link href="/tienda" className="rs-btn-new mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const fmt = getFormat(producto.formato?.nombre);
  const artistNames = getArtists(producto);
  const genreNames = getGenres(producto);
  const isOut = productState.kind === 'out';
  const canIncrease = !isOut && quantity < producto.stockActual;
  const description =
    producto.descripcion ||
    'Edición seleccionada para coleccionistas y amantes de la música física. Una pieza especial para disfrutar con el sonido y presencia del formato original.';

  const handleAddToCart = async () => {
    if (isOut) return;

    try {
      await addToCarrito.mutateAsync({ idProducto: producto.id, cantidad: quantity });
      setNotify({
        type: 'success',
        title: 'Producto agregado al carrito.',
        message: `"${producto.titulo}" se agregó correctamente.`,
      });
    } catch (error: unknown) {
      const message = (error as Error).message ?? '';
      setNotify({
        type: 'error',
        title: 'No se pudo agregar el producto al carrito.',
        message: message.toLowerCase().includes('stock')
          ? 'No hay stock suficiente para este producto.'
          : 'Intenta de nuevo en unos segundos.',
      });
    }
  };

  return (
    <main className="rs-store-bg relative min-h-screen overflow-hidden">
      <StoreDecor />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-9 sm:px-6">
        <Link
          href="/tienda"
          className="rs-back-btn group mb-8 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Volver a tienda
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.04fr]">
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <div className="rs-store-surface overflow-hidden rounded-[18px] border">
              <div className="aspect-[1.55/1] min-h-[360px]">
                <ProductArtwork producto={producto} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniCard Icon={fmt.Icon} label="Formato" value={fmt.label} />
              <MiniCard Icon={Music2} label="Categoría" value={producto.categoria?.nombre ?? 'No disponible'} />
              <MiniCard Icon={Package} label="Estado" value={productState.label} status={productState.kind} />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="rs-store-surface flex min-h-[520px] flex-col rounded-[18px] border p-7 sm:p-9"
          >
            <span
              className="mb-6 w-fit rounded-full border px-4 py-1.5 text-sm font-extrabold"
              style={{
                borderColor: 'hsl(var(--brand) / 0.30)',
                backgroundColor: 'hsl(var(--brand) / 0.10)',
                color: 'hsl(var(--brand))',
              }}
            >
              {fmt.label}
            </span>

            <h1 className="text-4xl font-extrabold tracking-normal text-foreground lg:text-5xl">
              {producto.titulo}
            </h1>

            {artistNames && (
              <p className="mt-3 text-xl font-semibold text-muted-foreground">{artistNames}</p>
            )}

            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-muted-foreground">
              {description}
            </p>

            <p className="mt-8 text-4xl font-extrabold text-brand sm:text-5xl">
              Q{Number(producto.precioVenta).toFixed(2)}
            </p>

            <div className="mt-6">
              <StatusLine status={productState} stock={producto.stockActual} />
            </div>

            <div className="rs-store-control mt-7 inline-flex w-fit overflow-hidden rounded-[16px] border">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={isOut || quantity <= 1}
                className="flex h-14 w-16 items-center justify-center text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex h-14 w-24 items-center justify-center border-x border-border text-xl font-extrabold text-foreground">
                {isOut ? 0 : quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(producto.stockActual, value + 1))}
                disabled={!canIncrease}
                className="flex h-14 w-16 items-center justify-center text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-auto space-y-4 pt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOut || addToCarrito.isPending}
                className="rs-checkout-btn"
              >
                <ShoppingCart className="h-5 w-5" />
                {addToCarrito.isPending ? 'Agregando…' : isOut ? 'Producto agotado' : 'Agregar al carrito'}
              </button>

              <Link href="/tienda" className="rs-detail-btn-outline">
                <Compass className="h-5 w-5" />
                Seguir explorando
              </Link>
            </div>
          </motion.section>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <SpecsCard producto={producto} formatLabel={fmt.label} status={productState} genres={genreNames} />
          <TrustCard />
        </div>
      </div>

      <AnimatePresence>
        {notify && (
          <NotifyModal
            type={notify.type}
            title={notify.title}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

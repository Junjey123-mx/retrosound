'use client';

import Link from 'next/link';
import { ArrowLeft, PackageSearch, ShoppingBag, Music2, RefreshCw } from 'lucide-react';
import { useMisOrdenes } from '@/hooks/use-mis-ordenes';
import type { Orden } from '@/lib/services/mis-ordenes';

const STATUS_CONFIG: Record<Orden['estadoVenta'], { label: string; className: string }> = {
  pendiente:  { label: 'Pendiente',  className: 'rs-badge-pendiente'  },
  completada: { label: 'Completada', className: 'rs-badge-completada' },
  cancelada:  { label: 'Cancelada',  className: 'rs-badge-cancelada'  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function SkeletonOrden() {
  return (
    <div className="rs-store-surface rounded-[18px] border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex justify-end pt-2">
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function OrdenCard({ orden }: { orden: Orden }) {
  const status = STATUS_CONFIG[orden.estadoVenta] ?? { label: orden.estadoVenta, className: 'rs-badge-pendiente' };

  return (
    <article className="rs-store-surface group rounded-[18px] border p-6 transition hover:border-brand/30">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pedido #{orden.idVenta}
          </p>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {formatDate(orden.fechaVenta)} · {orden.metodoPago}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Items */}
      <ul className="mt-4 divide-y divide-border/60">
        {orden.items.map((item, idx) => (
          <li key={idx} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.tituloProducto}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {item.formato}
                {item.artistas?.length > 0 && ` · ${item.artistas.join(', ')}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-foreground">
                Q{Number(item.totalLinea).toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.cantidad} × Q{Number(item.precioUnitario).toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-lg font-extrabold" style={{ color: 'hsl(var(--brand))' }}>
          Q{Number(orden.total).toFixed(2)}
        </span>
      </div>
    </article>
  );
}

export default function MisOrdenesPage() {
  const { data: ordenes, isLoading, isError, refetch } = useMisOrdenes();

  return (
    <main className="rs-store-bg relative min-h-screen font-sans">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">

        {/* Back */}
        <Link href="/tienda" className="rs-back-btn group inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Volver a la tienda
        </Link>

        {/* Header */}
        <div className="mt-8 flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
            style={{ backgroundColor: 'hsl(var(--brand) / 0.10)', borderColor: 'hsl(var(--brand) / 0.25)' }}
          >
            <ShoppingBag className="h-6 w-6" style={{ color: 'hsl(var(--brand))' }} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Mis órdenes
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Historial y estado de tus compras en RetroSound.
            </p>
          </div>
        </div>

        {/* Content */}
        <section className="mt-8 space-y-4">
          {isLoading && (
            <>
              <SkeletonOrden />
              <SkeletonOrden />
              <SkeletonOrden />
            </>
          )}

          {isError && (
            <div className="rs-store-surface rounded-[18px] border p-12 text-center">
              <Music2 className="mx-auto h-10 w-10" style={{ color: 'hsl(var(--brand))' }} />
              <p className="mt-4 text-lg font-extrabold text-foreground">
                No se pudo cargar tus órdenes.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rs-card-btn-primary"
                  style={{ width: 'auto', minWidth: '9rem', padding: '0 1.5rem' }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && ordenes?.length === 0 && (
            <div className="rs-store-surface rounded-[18px] border p-14 text-center">
              <PackageSearch className="mx-auto h-12 w-12" style={{ color: 'hsl(var(--brand))' }} />
              <p className="mt-4 text-lg font-extrabold text-foreground">
                Todavía no tienes órdenes.
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Explora el catálogo y realiza tu primera compra.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/tienda"
                  className="rs-card-btn-secondary"
                  style={{ width: 'auto', minWidth: '9rem', padding: '0 1.5rem' }}
                >
                  Ir a la tienda
                </Link>
              </div>
            </div>
          )}

          {!isLoading && !isError && ordenes && ordenes.length > 0 && (
            <>
              <p className="text-right text-xs font-semibold text-muted-foreground">
                {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'}
              </p>
              {ordenes.map((orden) => (
                <OrdenCard key={orden.idVenta} orden={orden} />
              ))}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

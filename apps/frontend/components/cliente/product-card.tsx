'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Disc3, Music2, Radio, ShoppingCart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Producto } from '@/types';
import { useAddToCarrito } from '@/hooks/use-carrito';
import { NotifyModal } from '@/components/ui/notify-modal';

const FORMAT_CONFIG: Record<string, { label: string; Icon: LucideIcon; badgeClass: string }> = {
  vinilo: { label: 'Vinilo', Icon: Disc3,  badgeClass: 'rs-format-vinilo' },
  cd:     { label: 'CD',     Icon: Music2, badgeClass: 'rs-format-cd'     },
  casete: { label: 'Casete', Icon: Radio,  badgeClass: 'rs-format-casete' },
};

function normalizeFormat(nombre?: string) {
  return nombre
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getFormat(nombre?: string) {
  const key = normalizeFormat(nombre) ?? 'vinilo';
  return FORMAT_CONFIG[key] ?? { label: nombre ?? 'Vinilo', Icon: Disc3, badgeClass: 'rs-format-default' };
}

function ProductVisual({ producto }: { producto: Producto }) {
  const fmt = getFormat(producto.formato?.nombre);
  const imagen = producto.imagenUrl ?? producto.imagen;

  return (
    <div className="rs-product-media relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border">
      <div className="rs-product-record absolute right-[12%] h-36 w-36 rounded-full sm:right-[15%]">
        <div className="absolute inset-[18px] rounded-full border border-white/5" />
        <div className="absolute inset-[36px] rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/85 shadow-inner" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/85" />
      </div>

      <div className="rs-product-cover relative z-10 flex aspect-square h-40 items-center justify-center overflow-hidden rounded-xl border text-center shadow-lg">
        {imagen ? (
          <img
            src={imagen}
            alt={producto.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-card p-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted text-brand">
              <fmt.Icon className="h-10 w-10" />
            </div>
            <span className="mt-3 line-clamp-2 text-xs font-extrabold text-foreground">{producto.titulo}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCard({ producto }: { producto: Producto }) {
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const addToCarrito = useAddToCarrito();

  const fmt = getFormat(producto.formato?.nombre);
  const isUnavailable =
    producto.estado === 'agotado' ||
    producto.estado === 'inactivo' ||
    producto.estado === 'descontinuado' ||
    producto.stockActual <= 0;

  const artistNames = producto.artistas?.map((a) => a.artista.nombre).filter(Boolean).join(', ');
  const subtitle = artistNames || producto.categoria?.nombre || producto.generos?.[0]?.generoMusical.nombre || 'RetroSound';

  const handleAddToCart = async () => {
    if (isUnavailable) return;

    try {
      await addToCarrito.mutateAsync({ idProducto: producto.id, cantidad: 1 });
      setNotify({
        type: 'success',
        title: 'Agregado',
        message: `"${producto.titulo}" está en tu carrito.`,
      });
    } catch (err: unknown) {
      setNotify({
        type: 'error',
        title: 'Error',
        message: (err as Error).message ?? 'No se pudo agregar al carrito.',
      });
    }
  };

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="rs-store-card group relative flex h-full min-h-[410px] flex-col rounded-[18px] border p-5"
    >
      <span className={`rs-store-format-badge absolute left-7 top-7 z-20 inline-flex h-9 items-center rounded-full border px-5 text-sm font-extrabold ${fmt.badgeClass}`}>
        {fmt.label}
      </span>

      <div className="w-full">
        <ProductVisual producto={producto} />
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="line-clamp-2 min-h-13 text-lg font-bold leading-snug text-foreground" title={producto.titulo}>
          {producto.titulo}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
        {producto.anioLanzamiento && (
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-muted-foreground/70">
            {producto.anioLanzamiento}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <span className="text-xl font-bold leading-none text-brand">
            Q{Number(producto.precioVenta).toFixed(2)}
          </span>
          {isUnavailable ? (
            <span className="rs-badge-pendiente rounded-full px-3 py-0.5 text-xs font-semibold">Agotado</span>
          ) : (
            <span className="rs-badge-completada rounded-full px-3 py-0.5 text-xs font-semibold">Stock: {producto.stockActual}</span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isUnavailable || addToCarrito.isPending}
            className="rs-card-btn-primary"
          >
            <ShoppingCart className="h-4 w-4" />
            {isUnavailable ? 'Agotado' : addToCarrito.isPending ? 'Agregando…' : 'Agregar'}
          </button>

          <Link href={`/tienda/${producto.id}` as any} className="rs-card-btn-secondary">
            Ver detalle
          </Link>
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
    </motion.article>
  );
}

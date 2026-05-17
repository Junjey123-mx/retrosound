import Link from 'next/link';
import { Disc3, Music2, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">

      {/* Decorative vinyl */}
      <div className="relative mb-10 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full border-[12px] border-border bg-card shadow-md">
          <div className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 border-4 border-brand/20">
            <Disc3 className="h-7 w-7 text-brand" />
          </div>
        </div>
        <Music2 className="absolute -right-6 -top-4 h-8 w-8 rotate-12 text-muted-foreground/30" />
      </div>

      {/* Text */}
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        RetroSound
      </p>
      <h1 className="mb-3 text-8xl font-extrabold tracking-tighter text-foreground">
        404
      </h1>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        Esta pista no existe.
      </h2>
      <p className="mb-10 max-w-sm text-center text-sm text-muted-foreground">
        La página que buscas no está disponible o fue movida a otra ubicación.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Link
          href="/tienda"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ShoppingBag className="h-4 w-4" />
          Ir a la tienda
        </Link>
      </div>

    </main>
  );
}

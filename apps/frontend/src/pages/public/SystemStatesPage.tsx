import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Disc3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SystemStatesPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-12">

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">RetroSound</p>
          <h1 className="text-3xl font-bold text-foreground">Estados del sistema</h1>
          <p className="text-sm text-muted-foreground">Referencia visual de los componentes de estado.</p>
        </div>

        {/* EmptyState */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">EmptyState</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <EmptyState
              title="Sin resultados"
              description="No se encontraron registros con esos filtros."
              action={
                <button type="button" disabled className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground opacity-50 cursor-not-allowed">
                  Limpiar filtros
                </button>
              }
            />
            <EmptyState
              icon={<Disc3 className="h-7 w-7" />}
              title="Sin productos"
              description="Agrega tu primer producto para comenzar."
              action={
                <button type="button" disabled className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white opacity-50 cursor-not-allowed">
                  Agregar producto
                </button>
              }
            />
          </div>
        </section>

        {/* ErrorState */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">ErrorState</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ErrorState
              title="No se pudo cargar"
              description="Ocurrió un error al obtener los datos del servidor."
              action={
                <button type="button" disabled className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger opacity-50 cursor-not-allowed">
                  Reintentar
                </button>
              }
            />
            <ErrorState
              title="Error de red"
              error={new Error('Connection timeout after 30s')}
            />
          </div>
        </section>

        {/* LoadingState */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">LoadingState</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">variant=page</p>
              <LoadingState variant="page" label="Cargando datos…" size="md" />
            </div>
            <div className="rounded-2xl border border-border p-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">variant=inline</p>
              <div className="flex items-center gap-4 py-8 justify-center">
                <LoadingState variant="inline" label="Procesando…" />
              </div>
            </div>
            <div className="rounded-2xl border border-border p-6 sm:col-span-2">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">variant=table</p>
              <LoadingState variant="table" />
            </div>
            <div className="rounded-2xl border border-border p-6 sm:col-span-2">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">variant=cards</p>
              <LoadingState variant="cards" />
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-border">
          <Link to="/" className="text-sm text-brand hover:text-brand-hover font-medium">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  );
}

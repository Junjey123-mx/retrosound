'use client';

import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  Truck,
  Store,
  BoxesIcon,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { useDashboardInventario } from '@/hooks/use-inventario';
import { RoleGuard }   from '@/components/guards/role-guard';
import { PageHeader }  from '@/components/ui/page-header';
import { StatCard }    from '@/components/ui/stat-card';
import { Badge }       from '@/components/ui/badge';
import { Button }      from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';
import { ROUTES }      from '@/lib/constants/routes';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtFecha(raw?: string | null) {
  if (!raw) return '—';
  return String(raw).slice(0, 10);
}

function estadoVariant(estado: string) {
  switch (estado) {
    case 'pendiente': return 'warning'   as const;
    case 'parcial':   return 'info'      as const;
    case 'recibida':  return 'success'   as const;
    case 'cancelada': return 'muted'     as const;
    default:          return 'outline'   as const;
  }
}

// ─── page content ─────────────────────────────────────────────────────────────

function InventarioContent() {
  const { data, isLoading, error } = useDashboardInventario();

  if (isLoading) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Inventario"
          description="Supervisa stock, recepciones y productos críticos"
          icon={<BoxesIcon className="h-5 w-5" />}
        />
        <LoadingState variant="cards" label="Cargando métricas…" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 sm:p-8">
        <ErrorState title="Error al cargar el dashboard de inventario" error={error} />
      </main>
    );
  }

  const stats = data?.stats;
  const recent = data?.recentItems;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Inventario"
        description="Supervisa stock, recepciones y productos críticos"
        icon={<BoxesIcon className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.dashboard.inventarioRecepciones as any}>Ver recepciones</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={ROUTES.dashboard.inventarioStock as any}>Stock crítico</Link>
            </Button>
          </div>
        }
      />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Productos activos"
          value={stats?.productosActivos ?? 0}
          icon={<Package className="h-5 w-5" />}
          tone="default"
        />
        <StatCard
          title="Stock crítico"
          value={stats?.stockCritico ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
          description="En o bajo mínimo"
        />
        <StatCard
          title="Agotados"
          value={stats?.productosAgotados ?? 0}
          icon={<BoxesIcon className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          title="Recepciones pendientes"
          value={stats?.recepcionesPendientes ?? 0}
          icon={<Truck className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          title="Proveedores activos"
          value={stats?.proveedoresActivos ?? 0}
          icon={<Store className="h-5 w-5" />}
          tone="secondary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* recepciones recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recepciones recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href={ROUTES.dashboard.inventarioRecepciones as any}>
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recent?.recepcionesRecientes?.length ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="Sin recepciones pendientes"
                description="No hay entregas en curso actualmente."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recent.recepcionesRecientes.map((r) => (
                  <li key={r.idCompra} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        #{r.idCompra} — {r.proveedor ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">{fmtFecha(r.fecha)}</p>
                    </div>
                    <Badge variant={estadoVariant(r.estado)}>{r.estado}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* stock crítico */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos en riesgo</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href={ROUTES.dashboard.inventarioStock as any}>
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recent?.stockCriticoItems?.length ? (
              <EmptyState
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Stock en buen estado"
                description="Todos los productos superan su stock mínimo."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recent.stockCriticoItems.map((p) => (
                  <li key={p.idProducto} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {p.stockActual} / Mínimo: {p.stockMinimo}
                      </p>
                    </div>
                    <Badge variant={p.stockActual === 0 ? 'danger' : 'warning'}>
                      {p.stockActual === 0 ? 'Agotado' : 'Bajo mínimo'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.dashboard.productos}>Productos</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.dashboard.proveedores}>Proveedores</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.dashboard.inventarioRecepciones as any}>Recepciones</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.dashboard.inventarioStock as any}>Stock crítico</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </main>
  );
}

export default function InventarioPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <InventarioContent />
    </RoleGuard>
  );
}

import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  User,
  LayoutDashboard,
  ArrowRight,
  ClipboardList,
  Plus,
} from 'lucide-react';
import {
  useProveedorDashboard,
  useProveedorEntregas,
  useProveedorProductos,
} from '@/hooks/use-proveedor-portal';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants/routes';

function fmtFecha(raw?: string | null) {
  if (!raw) return '—';
  return String(raw).slice(0, 10);
}

function estadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'pendiente': return 'warning' as const;
    case 'parcial':   return 'info'    as const;
    case 'recibida':  return 'success' as const;
    case 'cancelada': return 'muted'   as const;
    default:          return 'outline' as const;
  }
}

function productoBadgeVariant(estado: string) {
  switch (estado) {
    case 'activo':        return 'success' as const;
    case 'agotado':       return 'danger'  as const;
    case 'descontinuado': return 'muted'   as const;
    default:              return 'outline' as const;
  }
}

function ProveedorContent() {
  const dashboard       = useProveedorDashboard();
  const entregasQuery   = useProveedorEntregas({ page: 1, limit: 5 });
  const productosQuery  = useProveedorProductos({ page: 1, limit: 5 });

  if (dashboard.isLoading) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Portal proveedor"
          description="Gestiona tus productos y entregas en RetroSound"
          icon={<LayoutDashboard className="h-5 w-5" />}
        />
        <LoadingState variant="cards" label="Cargando métricas…" />
      </main>
    );
  }

  if (dashboard.error) {
    return (
      <main className="p-6 sm:p-8">
        <ErrorState
          title="Error al cargar el portal proveedor"
          error={dashboard.error}
        />
      </main>
    );
  }

  const d = dashboard.data;

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Portal proveedor"
        description="Gestiona tus productos y entregas en RetroSound"
        icon={<LayoutDashboard className="h-5 w-5" />}
        action={
          <Button asChild size="sm">
            <Link to={ROUTES.proveedor.entregasNueva as any}>
              <Plus className="mr-1.5 h-4 w-4" />
              Registrar entrega
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Productos asociados"
          value={d?.totalProductos ?? 0}
          icon={<Package className="h-5 w-5" />}
          tone="default"
        />
        <StatCard
          title="Total entregas"
          value={d?.totalEntregas ?? 0}
          icon={<Truck className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          title="Entregas pendientes"
          value={d?.entregasPendientes ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Entregas recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link to={ROUTES.proveedor.entregas as any}>
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {entregasQuery.isLoading ? (
              <LoadingState variant="inline" label="Cargando…" />
            ) : entregasQuery.error ? (
              <ErrorState title="Error al cargar entregas" error={entregasQuery.error} />
            ) : !entregasQuery.data?.data?.length ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="Sin entregas registradas"
                description="Aún no has registrado ninguna entrega."
              />
            ) : (
              <ul className="divide-y divide-border">
                {entregasQuery.data.data.map((e) => (
                  <li key={e.idCompra} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        #{e.idCompra}
                        {e.detalles[0] && ` — ${e.detalles[0].producto.titulo}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{fmtFecha(e.fecha)}</p>
                    </div>
                    <Badge variant={estadoBadgeVariant(e.estado)}>{e.estado}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mis productos</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link to={ROUTES.proveedor.productos as any}>
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {productosQuery.isLoading ? (
              <LoadingState variant="inline" label="Cargando…" />
            ) : productosQuery.error ? (
              <ErrorState title="Error al cargar productos" error={productosQuery.error} />
            ) : !productosQuery.data?.data?.length ? (
              <EmptyState
                icon={<Package className="h-6 w-6" />}
                title="Sin productos asociados"
                description="No tienes productos asociados a tu cuenta."
              />
            ) : (
              <ul className="divide-y divide-border">
                {productosQuery.data.data.map((p) => (
                  <li key={p.idProducto} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.tituloProducto}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {p.codigoSku} · Stock: {p.stockActual}
                      </p>
                    </div>
                    <Badge variant={productoBadgeVariant(p.estadoProducto)}>
                      {p.estadoProducto}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.proveedor.productos as any}>
                <Package className="mr-1.5 h-4 w-4" />
                Mis productos
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.proveedor.entregas as any}>
                <Truck className="mr-1.5 h-4 w-4" />
                Mis entregas
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to={ROUTES.proveedor.entregasNueva as any}>
                <Plus className="mr-1.5 h-4 w-4" />
                Registrar entrega
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.proveedor.perfil as any}>
                <User className="mr-1.5 h-4 w-4" />
                Mi perfil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export function ProviderDashboardPage() {
  return <ProveedorContent />;
}

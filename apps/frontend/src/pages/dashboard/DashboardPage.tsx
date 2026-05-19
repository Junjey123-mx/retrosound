'use client';

import { Link, Navigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { RoleGuard } from '@/components/guards/role-guard';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAdminDashboard } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import type {
  DashboardAlertaStock,
  DashboardCompra,
  DashboardVenta,
} from '@/lib/services/dashboard';

type StatTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const VENTA_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
  pendiente:  'warning',
  completada: 'success',
  cancelada:  'danger',
};

function formatQ(value: string | number | undefined) {
  return `Q${Number(value ?? 0).toFixed(2)}`;
}

function formatDate(iso: string) {
  return String(iso).slice(0, 10);
}

const QUICK_LINKS = [
  { href: '/dashboard/productos',   Icon: Package,      label: 'Productos'   },
  { href: '/dashboard/proveedores', Icon: Truck,        label: 'Proveedores' },
  { href: '/dashboard/ventas',      Icon: ShoppingCart, label: 'Ventas'      },
  { href: '/dashboard/reportes',    Icon: BarChart3,    label: 'Reportes'    },
  { href: '/dashboard/perfil',      Icon: Users,        label: 'Perfil'      },
] as const;

const STOCK_COLS = [
  {
    key: 'titulo_producto',
    header: 'Producto',
    render: (r: DashboardAlertaStock) => (
      <div>
        <p className="font-semibold text-foreground leading-tight">{r.titulo_producto}</p>
        <p className="text-xs text-muted-foreground">{r.codigo_sku}</p>
      </div>
    ),
  },
  {
    key: 'nombre_categoria',
    header: 'Categoría',
    render: (r: DashboardAlertaStock) => (
      <span className="text-muted-foreground">{r.nombre_categoria} · {r.nombre_formato}</span>
    ),
  },
  {
    key: 'stock_actual',
    header: 'Stock',
    className: 'text-center',
    render: (r: DashboardAlertaStock) => (
      <div className="text-center">
        <Badge variant="warning">{r.stock_actual} / {r.stock_minimo}</Badge>
        <p className="mt-0.5 text-xs text-muted-foreground">actual / mín</p>
      </div>
    ),
  },
] satisfies { key: string; header: string; render: (r: DashboardAlertaStock) => React.ReactNode; className?: string }[];

const COMPRAS_COLS = [
  {
    key: 'nombre_proveedor',
    header: 'Proveedor',
    render: (r: DashboardCompra) => (
      <div>
        <p className="font-semibold text-foreground leading-tight">{r.nombre_proveedor}</p>
        <p className="text-xs text-muted-foreground">Resp: {r.empleado}</p>
      </div>
    ),
  },
  {
    key: 'fecha_compra_proveedor',
    header: 'Fecha',
    render: (r: DashboardCompra) => (
      <span className="text-muted-foreground">{formatDate(r.fecha_compra_proveedor)}</span>
    ),
  },
  {
    key: 'num_productos',
    header: 'Productos',
    className: 'text-center',
    render: (r: DashboardCompra) => (
      <Badge variant="info">{r.num_productos}</Badge>
    ),
  },
] satisfies { key: string; header: string; render: (r: DashboardCompra) => React.ReactNode; className?: string }[];

const VENTAS_COLS = [
  {
    key: 'id_venta',
    header: 'ID',
    render: (r: DashboardVenta) => (
      <span className="font-mono text-xs text-muted-foreground">#{r.id_venta}</span>
    ),
  },
  {
    key: 'fecha_venta',
    header: 'Fecha',
    render: (r: DashboardVenta) => (
      <span className="text-muted-foreground">{formatDate(r.fecha_venta)}</span>
    ),
  },
  {
    key: 'cliente',
    header: 'Cliente',
    render: (r: DashboardVenta) => (
      <span className="font-medium text-foreground">{r.cliente}</span>
    ),
  },
  {
    key: 'metodo_pago',
    header: 'Método',
    render: (r: DashboardVenta) => (
      <span className="capitalize text-muted-foreground">{r.metodo_pago}</span>
    ),
  },
  {
    key: 'estado_venta',
    header: 'Estado',
    className: 'text-center',
    render: (r: DashboardVenta) => (
      <Badge variant={VENTA_BADGE[r.estado_venta] ?? 'muted'} className="capitalize">
        {r.estado_venta}
      </Badge>
    ),
  },
  {
    key: 'total_neto',
    header: 'Total neto',
    className: 'text-right',
    render: (r: DashboardVenta) => (
      <span className="font-mono font-semibold text-foreground">{formatQ(r.total_neto)}</span>
    ),
  },
] satisfies { key: string; header: string; render: (r: DashboardVenta) => React.ReactNode; className?: string }[];

function DashboardContent() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();
  const s = data?.stats;

  const statCards: { label: string; value: string | number; tone: StatTone; icon: React.ReactNode; description?: string }[] = s
    ? [
        {
          label: 'Productos activos',
          value: s.productos_activos ?? 0,
          tone: 'default',
          icon: <Package className="h-5 w-5" />,
        },
        {
          label: 'Ventas completadas',
          value: s.ventas_completadas ?? 0,
          tone: 'success',
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
          label: 'Total vendido (mes)',
          value: formatQ(s.total_vendido_mes),
          tone: 'success',
          icon: <TrendingUp className="h-5 w-5" />,
          description: 'ventas completadas',
        },
        {
          label: 'Stock crítico',
          value: s.productos_stock_critico ?? 0,
          tone: (s.productos_stock_critico ?? 0) > 0 ? 'warning' : 'default',
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          label: 'Productos agotados',
          value: s.productos_agotados ?? 0,
          tone: (s.productos_agotados ?? 0) > 0 ? 'danger' : 'default',
          icon: <XCircle className="h-5 w-5" />,
        },
        {
          label: 'Compras pendientes',
          value: s.compras_pendientes ?? 0,
          tone: (s.compras_pendientes ?? 0) > 0 ? 'warning' : 'default',
          icon: <Clock className="h-5 w-5" />,
        },
        ...(s.usuarios_activos !== undefined
          ? [{
              label: 'Usuarios activos',
              value: s.usuarios_activos,
              tone: 'info' as StatTone,
              icon: <Users className="h-5 w-5" />,
            }]
          : []),
        ...(s.proveedores_activos !== undefined
          ? [{
              label: 'Proveedores activos',
              value: s.proveedores_activos,
              tone: 'secondary' as StatTone,
              icon: <Truck className="h-5 w-5" />,
            }]
          : []),
      ]
    : [];

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <PageHeader
          title="Dashboard"
          description="Resumen general de RetroSound"
          icon={<BarChart3 className="h-5 w-5" />}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to={'/dashboard/reportes' as any}>Ver reportes</Link>
            </Button>
          }
        />

        {/* Loading */}
        {isLoading && <LoadingState label="Cargando estadísticas…" />}

        {/* Error */}
        {isError && (
          <ErrorState
            title="No se pudieron cargar las estadísticas"
            error={error}
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          />
        )}

        {/* Content */}
        {data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {statCards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  tone={card.tone}
                  icon={card.icon}
                  description={card.description}
                />
              ))}
            </div>

            {/* Accesos rápidos */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Accesos rápidos
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {QUICK_LINKS.map(({ href, Icon, label }) => (
                  <Link
                    key={href}
                    to={href as any}
                    className="rs-btn-logout group flex items-center gap-3 rounded-xl bg-card p-4 text-sm font-semibold active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-150 group-hover:border-brand/30 group-hover:bg-brand/8 group-hover:text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Paneles: Stock crítico + Compras pendientes */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Stock crítico */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Stock crítico
                    {data.alertasStock.length > 0 && (
                      <Badge variant="warning" className="ml-auto">{data.alertasStock.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.alertasStock.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-6 w-6 text-success" />}
                      title="Todo en orden"
                      description="Todos los productos tienen stock suficiente."
                    />
                  ) : (
                    <DataTable<DashboardAlertaStock>
                      columns={STOCK_COLS}
                      data={data.alertasStock}
                      getRowKey={(r) => r.id_producto}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Compras pendientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <Truck className="h-4 w-4 text-warning" />
                    Compras pendientes
                    {data.comprasPendientes.length > 0 && (
                      <Badge variant="warning" className="ml-auto">{data.comprasPendientes.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.comprasPendientes.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-6 w-6 text-success" />}
                      title="Sin pendientes"
                      description="No hay compras pendientes de recibir."
                    />
                  ) : (
                    <DataTable<DashboardCompra>
                      columns={COMPRAS_COLS}
                      data={data.comprasPendientes}
                      getRowKey={(r) => r.id_compra_proveedor}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ventas recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Receipt className="h-4 w-4 text-brand" />
                  Ventas recientes
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    Últimas {data.ventasRecientes.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.ventasRecientes.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingCart className="h-6 w-6" />}
                    title="Sin ventas recientes"
                    description="Aún no hay ventas registradas."
                  />
                ) : (
                  <DataTable<DashboardVenta>
                    columns={VENTAS_COLS}
                    data={data.ventasRecientes}
                    getRowKey={(r) => r.id_venta}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

function DashboardRoot() {
  const user = useCurrentUser();
  if (user?.rol === 'empleado_ventas')     return <Navigate to="/dashboard/ventas"    replace />;
  if (user?.rol === 'empleado_inventario') return <Navigate to="/dashboard/inventario" replace />;
  return <DashboardContent />;
}

export function DashboardPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_ventas', 'empleado_inventario']}>
      <DashboardRoot />
    </RoleGuard>
  );
}

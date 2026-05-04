'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle,
  XCircle, Clock, Disc3, Truck, BarChart3, Receipt,
} from 'lucide-react';

interface DashboardStats {
  productos_activos:       number;
  productos_agotados:      number;
  productos_stock_critico: number;
  ventas_completadas:      number;
  compras_pendientes:      number;
  total_vendido_mes:       string;
}
interface AlertaStock {
  id_producto:      number;
  titulo_producto:  string;
  codigo_sku:       string;
  stock_actual:     number;
  stock_minimo:     number;
  nombre_categoria: string;
  nombre_formato:   string;
}
interface CompraP {
  id_compra_proveedor:    number;
  fecha_compra_proveedor: string;
  nombre_proveedor:       string;
  empleado:               string;
  num_productos:          number;
}
interface VentaR {
  id_venta:     number;
  fecha_venta:  string;
  estado_venta: string;
  metodo_pago:  string;
  cliente:      string;
  total_neto:   string;
}
interface DashboardData {
  stats:             DashboardStats;
  alertasStock:      AlertaStock[];
  comprasPendientes: CompraP[];
  ventasRecientes:   VentaR[];
}

const VENTA_BADGE: Record<string, string> = {
  pendiente:  'rs-badge-pendiente',
  completada: 'rs-badge-completada',
  cancelada:  'rs-badge-cancelada',
};


export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey:  ['dashboard'],
    queryFn:   reportesService.dashboard,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const s = data?.stats;

  const STAT_CARDS = s ? [
    {
      label: 'Productos activos',
      value: s.productos_activos,
      icon:  Package,
      color: 'border-l-violet-400',
      iconColor: 'text-action-alt',
    },
    {
      label: 'Ventas completadas',
      value: s.ventas_completadas,
      icon:  ShoppingCart,
      color: 'border-l-success',
      iconColor: 'text-success',
    },
    {
      label: 'Total vendido (mes)',
      value: `Q${Number(s.total_vendido_mes).toFixed(2)}`,
      sub:   'ventas completadas',
      icon:  TrendingUp,
      color: 'border-l-success',
      iconColor: 'text-success',
    },
    {
      label: 'Stock crítico',
      value: s.productos_stock_critico,
      icon:  AlertTriangle,
      color: s.productos_stock_critico > 0 ? 'border-l-amber-400' : 'border-l-border',
      iconColor: s.productos_stock_critico > 0 ? 'text-warning' : 'text-muted-foreground',
    },
    {
      label: 'Productos agotados',
      value: s.productos_agotados,
      icon:  XCircle,
      color: s.productos_agotados > 0 ? 'border-l-red-400' : 'border-l-border',
      iconColor: s.productos_agotados > 0 ? 'text-danger' : 'text-muted-foreground',
    },
    {
      label: 'Compras pendientes',
      value: s.compras_pendientes,
      icon:  Clock,
      color: s.compras_pendientes > 0 ? 'border-l-orange-400' : 'border-l-border',
      iconColor: s.compras_pendientes > 0 ? 'text-warning' : 'text-muted-foreground',
    },
  ] : [];

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          RetroSound Store — resumen ejecutivo en tiempo real
        </p>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Cargando estadísticas…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudieron cargar las estadísticas. Verifica tu sesión.
        </div>
      )}

      {/* KPI Cards */}
      {s && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border-l-4 bg-card p-4 shadow-sm ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight">
                  {card.label}
                </p>
                <card.icon className={`h-4 w-4 shrink-0 ${card.iconColor}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
              {card.sub && <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/dashboard/productos" className="rs-hover-success flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          <Disc3 className="h-5 w-5 text-muted-foreground" /> Productos
        </Link>
        <Link href="/dashboard/proveedores" className="rs-hover-success flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          <Truck className="h-5 w-5 text-muted-foreground" /> Proveedores
        </Link>
        <Link href="/dashboard/ventas" className="rs-hover-success flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" /> Ventas
        </Link>
        <Link href="/dashboard/reportes" className="rs-hover-success flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          <BarChart3 className="h-5 w-5 text-muted-foreground" /> Reportes SQL
        </Link>
      </div>

      {/* Alertas */}
      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Stock crítico */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Stock crítico
            </h2>
            {data.alertasStock.length === 0 ? (
              <p className="text-sm text-success">
                ✓ Todos los productos tienen stock suficiente.
              </p>
            ) : (
              <div className="divide-y divide-border text-sm">
                {data.alertasStock.map((p) => (
                  <div key={p.id_producto} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="font-medium text-foreground leading-tight">{p.titulo_producto}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.nombre_categoria} · {p.nombre_formato} · {p.codigo_sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                        {p.stock_actual} / {p.stock_minimo}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground">actual / mínimo</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Compras pendientes */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Truck className="h-4 w-4 text-warning" />
              Compras pendientes
            </h2>
            {data.comprasPendientes.length === 0 ? (
              <p className="text-sm text-success">
                ✓ No hay compras pendientes de recibir.
              </p>
            ) : (
              <div className="divide-y divide-border text-sm">
                {data.comprasPendientes.map((c) => (
                  <div key={c.id_compra_proveedor} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="font-medium text-foreground leading-tight">{c.nombre_proveedor}</p>
                      <p className="text-xs text-muted-foreground">Responsable: {c.empleado}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-warning">
                        {c.num_productos} producto{c.num_productos !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {String(c.fecha_compra_proveedor).slice(0, 10)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Ventas recientes */}
      {data && (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt className="h-4 w-4 text-info" />
            Ventas recientes
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Últimas 8
            </span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</th>
                  <th className="pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fecha</th>
                  <th className="pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cliente</th>
                  <th className="pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Método</th>
                  <th className="pb-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                  <th className="pb-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.ventasRecientes.map((v) => (
                  <tr key={v.id_venta} className="rs-table-row">
                    <td className="py-2.5 font-mono text-muted-foreground">#{v.id_venta}</td>
                    <td className="py-2.5 text-foreground">{String(v.fecha_venta).slice(0, 10)}</td>
                    <td className="py-2.5 font-medium text-foreground">{v.cliente}</td>
                    <td className="py-2.5 text-muted-foreground capitalize">{v.metodo_pago}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${VENTA_BADGE[v.estado_venta] ?? ''}`}>
                        {v.estado_venta}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-foreground">
                      Q{Number(v.total_neto).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </main>
  );
}

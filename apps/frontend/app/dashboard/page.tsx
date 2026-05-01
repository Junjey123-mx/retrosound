'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';

// ─── Tipos ───────────────────────────────────────────────────────────────────
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
  stats:            DashboardStats;
  alertasStock:     AlertaStock[];
  comprasPendientes: CompraP[];
  ventasRecientes:  VentaR[];
}

// ─── Colores de estado de venta ───────────────────────────────────────────────
const VENTA_BADGE: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  completada: 'bg-green-100 text-green-800',
  cancelada:  'bg-red-100 text-red-700',
};

// ─── Tarjeta de estadística ───────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg border-l-4 bg-white p-5 shadow-sm ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
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

  return (
    <main className="p-8">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          RetroSound Store — resumen ejecutivo en tiempo real
        </p>
      </div>

      {/* ── Tarjetas de estadísticas ── */}
      {isLoading && (
        <p className="mb-6 text-sm text-gray-400">⟳ Cargando estadísticas…</p>
      )}
      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudieron cargar las estadísticas. Verifica tu sesión.
        </div>
      )}

      {s && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-8">
          <StatCard
            label="Productos activos"
            value={s.productos_activos}
            color="border-blue-400"
          />
          <StatCard
            label="Ventas completadas"
            value={s.ventas_completadas}
            color="border-green-400"
          />
          <StatCard
            label="Total vendido (mes)"
            value={`Q${Number(s.total_vendido_mes).toFixed(2)}`}
            sub="ventas completadas"
            color="border-emerald-400"
          />
          <StatCard
            label="Stock crítico"
            value={s.productos_stock_critico}
            sub="stock ≤ mínimo"
            color={s.productos_stock_critico > 0 ? 'border-amber-400' : 'border-gray-200'}
          />
          <StatCard
            label="Productos agotados"
            value={s.productos_agotados}
            color={s.productos_agotados > 0 ? 'border-red-400' : 'border-gray-200'}
          />
          <StatCard
            label="Compras pendientes"
            value={s.compras_pendientes}
            color={s.compras_pendientes > 0 ? 'border-orange-400' : 'border-gray-200'}
          />
        </div>
      )}

      {/* ── Acceso rápido ── */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/productos"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          🎵 Productos
        </Link>
        <Link
          href="/dashboard/proveedores"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          🏭 Proveedores
        </Link>
        <Link
          href="/dashboard/ventas"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          🧾 Ventas
        </Link>
        <Link
          href="/dashboard/reportes"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          📊 Reportes SQL
        </Link>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Alertas: Stock crítico ── */}
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <span className="text-amber-500">⚠</span>
              Stock crítico
              <span className="ml-auto text-xs font-normal text-gray-400">
                stock_actual ≤ stock_minimo
              </span>
            </h2>

            {data.alertasStock.length === 0 ? (
              <p className="text-sm text-green-600">✓ Todos los productos tienen stock suficiente.</p>
            ) : (
              <div className="divide-y text-sm">
                {data.alertasStock.map((p) => (
                  <div key={p.id_producto} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium leading-tight">{p.titulo_producto}</p>
                      <p className="text-xs text-gray-400">
                        {p.nombre_categoria} · {p.nombre_formato} · {p.codigo_sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        {p.stock_actual} / {p.stock_minimo}
                      </span>
                      <p className="mt-0.5 text-xs text-gray-400">actual / mínimo</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Alertas: Compras pendientes ── */}
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <span className="text-orange-500">📦</span>
              Compras pendientes
              <span className="ml-auto text-xs font-normal text-gray-400">
                estado_compra = pendiente
              </span>
            </h2>

            {data.comprasPendientes.length === 0 ? (
              <p className="text-sm text-green-600">✓ No hay compras pendientes de recibir.</p>
            ) : (
              <div className="divide-y text-sm">
                {data.comprasPendientes.map((c) => (
                  <div key={c.id_compra_proveedor} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium leading-tight">{c.nombre_proveedor}</p>
                      <p className="text-xs text-gray-400">
                        Responsable: {c.empleado}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-orange-700">
                        {c.num_productos} producto{c.num_productos !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
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

      {/* ── Ventas recientes ── */}
      {data && (
        <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <span className="text-blue-500">🧾</span>
            Ventas recientes
            <span className="ml-auto text-xs font-normal text-gray-400">
              últimas 8 · JOIN venta + cliente + detalle_venta
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="pb-2 text-left font-medium text-gray-500">ID</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Fecha</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Cliente</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Método</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Estado</th>
                  <th className="pb-2 text-right font-medium text-gray-500">Total neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.ventasRecientes.map((v) => (
                  <tr key={v.id_venta} className="hover:bg-gray-50">
                    <td className="py-2 text-gray-400">#{v.id_venta}</td>
                    <td className="py-2">{String(v.fecha_venta).slice(0, 10)}</td>
                    <td className="py-2 font-medium">{v.cliente}</td>
                    <td className="py-2 text-gray-500">{v.metodo_pago}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${VENTA_BADGE[v.estado_venta] ?? ''}`}
                      >
                        {v.estado_venta}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">
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

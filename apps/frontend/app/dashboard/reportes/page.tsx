'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';
import { Database, AlertCircle, Loader2 } from 'lucide-react';

type Row = Record<string, unknown>;
type TabId = 'resumen' | 'ventas' | 'catalogo' | 'compras' | 'stock' | 'clientes' | 'vendidos' | 'ranking';

interface TabConfig {
  id:        TabId;
  label:     string;
  sqlType:   string;
  sqlColor:  string;
  desc:      string;
  criterio:  string;
}

const TABS: TabConfig[] = [
  {
    id: 'resumen', label: 'Resumen Ventas',
    sqlType: 'VIEW', sqlColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    desc: 'SELECT * FROM vista_resumen_ventas — calcula IVA 12% directamente en la vista SQL',
    criterio: 'Vista SQL con cálculo de IVA 12%',
  },
  {
    id: 'ventas', label: 'Ventas Detalle',
    sqlType: 'JOIN × 4', sqlColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    desc: 'venta JOIN cliente JOIN empleado JOIN detalle_venta JOIN producto',
    criterio: 'JOIN múltiple entre 4 tablas',
  },
  {
    id: 'catalogo', label: 'Catálogo',
    sqlType: 'JOIN × 6', sqlColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    desc: 'producto JOIN categoria JOIN formato LEFT JOIN artistas y géneros con STRING_AGG',
    criterio: 'JOIN múltiple con STRING_AGG',
  },
  {
    id: 'compras', label: 'Compras',
    sqlType: 'JOIN × 4', sqlColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    desc: 'compra_proveedor JOIN proveedor JOIN empleado JOIN detalle_compra JOIN producto',
    criterio: 'JOIN múltiple en cadena',
  },
  {
    id: 'stock', label: 'Stock Bajo',
    sqlType: 'SUBQUERY', sqlColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    desc: 'JOIN (SELECT AVG(stock_actual) FROM producto) — subquery escalar en cláusula FROM',
    criterio: 'Subquery escalar en cláusula FROM',
  },
  {
    id: 'clientes', label: 'Clientes Frecuentes',
    sqlType: 'EXISTS', sqlColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    desc: 'WHERE EXISTS (SELECT 1 FROM venta WHERE ...) + subquery correlacionado para conteo',
    criterio: 'Subquery EXISTS + subquery correlacionado',
  },
  {
    id: 'vendidos', label: 'Más Vendidos',
    sqlType: 'GROUP BY/HAVING', sqlColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    desc: 'SUM, COUNT, AVG con HAVING SUM(cantidad_vendida) ≥ mínimo configurable',
    criterio: 'GROUP BY + HAVING + funciones de agregación',
  },
  {
    id: 'ranking', label: 'Ranking Ingresos',
    sqlType: 'CTE + RANK', sqlColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    desc: 'WITH ingresos_producto AS (...) SELECT DENSE_RANK() OVER (ORDER BY ingresos DESC)',
    criterio: 'CTE (WITH) + función de ventana DENSE_RANK()',
  },
];

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
}

function ReportTable({ data }: { data: Row[] }) {
  if (!data.length) return (
    <p className="py-10 text-center text-sm text-muted-foreground">Sin datos para mostrar.</p>
  );
  const cols = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              {cols.map((c) => {
                const raw = formatCell(row[c]);
                const display = raw.length > 42 ? raw.slice(0, 40) + '…' : raw;
                return (
                  <td key={c} className="whitespace-nowrap px-3 py-2 text-foreground" title={raw}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        {data.length} filas · Fuente: PostgreSQL
      </div>
    </div>
  );
}

function ReportSection({ queryKey, queryFn }: { queryKey: string[]; queryFn: () => Promise<Row[]> }) {
  const { data, isLoading, error } = useQuery({ queryKey, queryFn, staleTime: 2 * 60 * 1000, retry: 1 });
  if (isLoading) return (
    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Ejecutando consulta SQL…
    </div>
  );
  if (error) return (
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {(error as Error).message}
    </div>
  );
  return <div className="mt-4">{data && <ReportTable data={data} />}</div>;
}

function ResumenVentasTab() {
  const [estado, setEstado] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['reportes', 'resumen', estado],
    queryFn:  () => reportesService.resumenVentas(estado),
    staleTime: 2 * 60 * 1000,
  });
  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Filtrar por estado:</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        {data && <span className="text-xs text-muted-foreground">{data.length} registros</span>}
      </div>
      {isLoading && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Consultando vista SQL…</div>}
      {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{(error as Error).message}</div>}
      {data && <div className="mt-4"><ReportTable data={data} /></div>}
    </>
  );
}

function MasVendidosTab() {
  const [min, setMin] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['reportes', 'mas-vendidos', min],
    queryFn:  () => reportesService.productosMasVendidos(min),
    staleTime: 2 * 60 * 1000,
  });
  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Mínimo vendidas (HAVING):</label>
        <input
          type="number"
          min={1}
          value={min}
          onChange={(e) => setMin(Math.max(1, Number(e.target.value)))}
          className="w-24 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {data && <span className="text-xs text-muted-foreground">{data.length} productos</span>}
      </div>
      {isLoading && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Ejecutando GROUP BY / HAVING…</div>}
      {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{(error as Error).message}</div>}
      {data && <div className="mt-4"><ReportTable data={data} /></div>}
    </>
  );
}

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-violet-500" />
          Reportes SQL
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultas explícitas ejecutadas en tiempo real contra PostgreSQL.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info del reporte activo */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm">
        <div className="flex items-start gap-3">
          <span className={`shrink-0 rounded-lg px-3 py-1 text-xs font-bold ${tab.sqlColor}`}>
            {tab.sqlType}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{tab.criterio}</p>
            <p className="text-xs text-muted-foreground font-mono">{tab.desc}</p>
          </div>
        </div>
      </div>

      {/* Contenido de la pestaña */}
      <div>
        {activeTab === 'resumen'  && <ResumenVentasTab />}
        {activeTab === 'vendidos' && <MasVendidosTab />}
        {activeTab === 'ventas'   && <ReportSection queryKey={['reportes', 'ventas-detalle']} queryFn={reportesService.ventasDetalle} />}
        {activeTab === 'catalogo' && <ReportSection queryKey={['reportes', 'productos-catalogo']} queryFn={reportesService.productosCatalogo} />}
        {activeTab === 'compras'  && <ReportSection queryKey={['reportes', 'compras-proveedor']} queryFn={reportesService.comprasProveedor} />}
        {activeTab === 'stock'    && <ReportSection queryKey={['reportes', 'productos-bajo-stock']} queryFn={reportesService.productosStockBajo} />}
        {activeTab === 'clientes' && <ReportSection queryKey={['reportes', 'clientes-frecuentes']} queryFn={reportesService.clientesFrecuentes} />}
        {activeTab === 'ranking'  && <ReportSection queryKey={['reportes', 'ranking-ingresos']} queryFn={reportesService.rankingIngresos} />}
      </div>

    </main>
  );
}

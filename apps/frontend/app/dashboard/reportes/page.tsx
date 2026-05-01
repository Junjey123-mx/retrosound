'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Row = Record<string, unknown>;
type TabId =
  | 'resumen'
  | 'ventas'
  | 'catalogo'
  | 'compras'
  | 'stock'
  | 'clientes'
  | 'vendidos'
  | 'ranking';

interface TabConfig {
  id:       TabId;
  label:    string;
  sqlType:  string;
  sqlColor: string;
  desc:     string;
}

// ─── Configuración de pestañas ────────────────────────────────────────────────
const TABS: TabConfig[] = [
  {
    id:       'resumen',
    label:    'Resumen Ventas',
    sqlType:  'VIEW',
    sqlColor: 'bg-teal-100 text-teal-800',
    desc:     'SELECT * FROM vista_resumen_ventas — calcula IVA 12% directamente en la vista SQL',
  },
  {
    id:       'ventas',
    label:    'Ventas Detalle',
    sqlType:  'JOIN × 4',
    sqlColor: 'bg-blue-100 text-blue-800',
    desc:     'venta JOIN cliente JOIN empleado JOIN detalle_venta JOIN producto',
  },
  {
    id:       'catalogo',
    label:    'Catálogo',
    sqlType:  'JOIN × 6',
    sqlColor: 'bg-blue-100 text-blue-800',
    desc:     'producto JOIN categoria JOIN formato LEFT JOIN artistas y géneros con STRING_AGG',
  },
  {
    id:       'compras',
    label:    'Compras',
    sqlType:  'JOIN × 4',
    sqlColor: 'bg-blue-100 text-blue-800',
    desc:     'compra_proveedor JOIN proveedor JOIN empleado JOIN detalle_compra JOIN producto',
  },
  {
    id:       'stock',
    label:    'Stock Bajo',
    sqlType:  'SUBQUERY (FROM)',
    sqlColor: 'bg-amber-100 text-amber-800',
    desc:     'JOIN (SELECT AVG(stock_actual) FROM producto) — subquery escalar en cláusula FROM',
  },
  {
    id:       'clientes',
    label:    'Clientes Frecuentes',
    sqlType:  'SUBQUERY EXISTS',
    sqlColor: 'bg-amber-100 text-amber-800',
    desc:     'WHERE EXISTS (SELECT 1 FROM venta WHERE ...) + subquery correlacionado para conteo',
  },
  {
    id:       'vendidos',
    label:    'Más Vendidos',
    sqlType:  'GROUP BY / HAVING',
    sqlColor: 'bg-green-100 text-green-800',
    desc:     'SUM, COUNT, AVG con HAVING SUM(cantidad_vendida) ≥ mínimo configurable',
  },
  {
    id:       'ranking',
    label:    'Ranking Ingresos',
    sqlType:  'CTE + DENSE_RANK',
    sqlColor: 'bg-purple-100 text-purple-800',
    desc:     'WITH ingresos_producto AS (...) SELECT DENSE_RANK() OVER (ORDER BY ingresos DESC)',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
}

// ─── Tabla genérica ───────────────────────────────────────────────────────────
function ReportTable({ data }: { data: Row[] }) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-gray-400">Sin datos para mostrar.</p>;
  }
  const cols = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs">
        <thead className="border-b bg-gray-50">
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-3 py-2 text-left font-medium text-gray-600"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {cols.map((c) => {
                const raw = formatCell(row[c]);
                const display = raw.length > 42 ? raw.slice(0, 40) + '…' : raw;
                return (
                  <td key={c} className="whitespace-nowrap px-3 py-2" title={raw}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-3 py-2 text-xs text-gray-400">{data.length} filas</p>
    </div>
  );
}

// ─── Sección genérica (carga, error, tabla) ───────────────────────────────────
function ReportSection({
  queryKey,
  queryFn,
}: {
  queryKey: string[];
  queryFn: () => Promise<Row[]>;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  if (isLoading)
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block animate-spin">⟳</span> Ejecutando consulta SQL…
      </p>
    );
  if (error)
    return (
      <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Error: {(error as Error).message}
      </div>
    );
  return <div className="mt-4">{data && <ReportTable data={data} />}</div>;
}

// ─── Pestaña: Resumen Ventas (con filtro de estado) ──────────────────────────
function ResumenVentasTab() {
  const [estado, setEstado] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey:  ['reportes', 'resumen', estado],
    queryFn:   () => reportesService.resumenVentas(estado),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium">Filtrar por estado:</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        {data && <span className="text-xs text-gray-400">{data.length} registros</span>}
      </div>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block animate-spin">⟳</span> Consultando vista SQL…
        </p>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {(error as Error).message}
        </div>
      )}
      {data && <div className="mt-4"><ReportTable data={data} /></div>}
    </>
  );
}

// ─── Pestaña: Más Vendidos (con filtro de mínimo) ────────────────────────────
function MasVendidosTab() {
  const [min, setMin] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey:  ['reportes', 'mas-vendidos', min],
    queryFn:   () => reportesService.productosMasVendidos(min),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium">Mínimo unidades vendidas (HAVING):</label>
        <input
          type="number"
          min={1}
          value={min}
          onChange={(e) => setMin(Math.max(1, Number(e.target.value)))}
          className="w-24 rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {data && <span className="text-xs text-gray-400">{data.length} productos</span>}
      </div>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block animate-spin">⟳</span> Ejecutando GROUP BY / HAVING…
        </p>
      )}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {(error as Error).message}
        </div>
      )}
      {data && <div className="mt-4"><ReportTable data={data} /></div>}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <main className="p-8">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold">Reportes SQL</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultas explícitas ejecutadas en tiempo real contra PostgreSQL.
        </p>
      </div>

      {/* Tira de pestañas */}
      <div className="mt-6 flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rounded-t-md border border-b-0 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="mt-4">
        {/* Badge SQL + descripción */}
        <div className="flex items-start gap-3">
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${tab.sqlColor}`}
          >
            {tab.sqlType}
          </span>
          <p className="text-sm text-gray-500">{tab.desc}</p>
        </div>

        {/* Contenido específico por pestaña */}
        {activeTab === 'resumen'  && <ResumenVentasTab />}
        {activeTab === 'vendidos' && <MasVendidosTab />}

        {activeTab === 'ventas' && (
          <ReportSection
            queryKey={['reportes', 'ventas-detalle']}
            queryFn={reportesService.ventasDetalle}
          />
        )}
        {activeTab === 'catalogo' && (
          <ReportSection
            queryKey={['reportes', 'productos-catalogo']}
            queryFn={reportesService.productosCatalogo}
          />
        )}
        {activeTab === 'compras' && (
          <ReportSection
            queryKey={['reportes', 'compras-proveedor']}
            queryFn={reportesService.comprasProveedor}
          />
        )}
        {activeTab === 'stock' && (
          <ReportSection
            queryKey={['reportes', 'productos-bajo-stock']}
            queryFn={reportesService.productosStockBajo}
          />
        )}
        {activeTab === 'clientes' && (
          <ReportSection
            queryKey={['reportes', 'clientes-frecuentes']}
            queryFn={reportesService.clientesFrecuentes}
          />
        )}
        {activeTab === 'ranking' && (
          <ReportSection
            queryKey={['reportes', 'ranking-ingresos']}
            queryFn={reportesService.rankingIngresos}
          />
        )}
      </div>

    </main>
  );
}

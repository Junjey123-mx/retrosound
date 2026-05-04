'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';
import { Database, AlertCircle, Loader2 } from 'lucide-react';

type Row = Record<string, unknown>;
type TabId = 'resumen' | 'ventas' | 'catalogo' | 'compras' | 'stock' | 'clientes' | 'vendidos' | 'ranking';

interface TabConfig {
  id:    TabId;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'resumen',  label: 'Resumen Ventas'     },
  { id: 'ventas',   label: 'Ventas Detalle'      },
  { id: 'catalogo', label: 'Catálogo'            },
  { id: 'compras',  label: 'Compras'             },
  { id: 'stock',    label: 'Stock Bajo'          },
  { id: 'clientes', label: 'Clientes Frecuentes' },
  { id: 'vendidos', label: 'Más Vendidos'        },
  { id: 'ranking',  label: 'Ranking Ingresos'    },
];

const COL_LABEL: Record<string, string> = {
  /* comunes */
  id_venta:                  'ID Venta',
  fecha_venta:               'Fecha de Venta',
  metodo_pago:               'Método de Pago',
  estado_venta:              'Estado',
  descuento_venta:           'Descuento Venta',
  /* clientes */
  id_cliente:                'ID Cliente',
  cliente:                   'Cliente',
  correo_cliente:            'Correo',
  telefono_cliente:          'Teléfono',
  direccion_cliente:         'Dirección',
  fecha_registro_cliente:    'Fecha de Registro',
  ventas_completadas:        'Ventas Completadas',
  /* empleado */
  empleado:                  'Empleado',
  empleado_responsable:      'Empleado Responsable',
  /* productos */
  id_producto:               'ID Producto',
  titulo_producto:           'Producto',
  codigo_sku:                'SKU',
  precio_venta:              'Precio de Venta',
  stock_actual:              'Stock Actual',
  stock_minimo:              'Stock Mínimo',
  estado_producto:           'Estado',
  nombre_categoria:          'Categoría',
  nombre_formato:            'Formato',
  artistas:                  'Artistas',
  generos:                   'Géneros',
  promedio_stock_general:    'Promedio General',
  /* detalle venta */
  cantidad_vendida:          'Cantidad',
  precio_unitario_venta:     'Precio Unitario',
  descuento_detalle:         'Descuento Ítem',
  subtotal:                  'Subtotal',
  /* resumen ventas */
  total_items:               'Ítems',
  total_bruto:               'Total Bruto',
  total_neto:                'Total Neto',
  iva_12:                    'IVA 12%',
  total:                     'Total con IVA',
  /* compras */
  id_compra_proveedor:       'ID Compra',
  fecha_compra_proveedor:    'Fecha de Compra',
  estado_compra:             'Estado',
  nombre_proveedor:          'Proveedor',
  correo_proveedor:          'Correo del Proveedor',
  cantidad_comprada:         'Cantidad',
  costo_unitario_compra:     'Costo Unitario',
  costo_total:               'Costo Total',
  /* más vendidos */
  total_unidades:            'Unidades Vendidas',
  en_ventas:                 'Nº de Ventas',
  ingresos_generados:        'Ingresos Generados',
  precio_promedio_venta:     'Precio Promedio',
  /* ranking */
  ranking:                   'Ranking',
  ingresos_totales:          'Ingresos Totales',
  unidades_vendidas:         'Unidades Vendidas',
};

function colLabel(key: string): string {
  return COL_LABEL[key.toLowerCase()] ?? key.replace(/_/g, ' ');
}

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
    <div className="rs-dash-section overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-background-soft">
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {colLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="rs-table-row">
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
          className="rounded-xl border border-input bg-input-bg px-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
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
          className="w-24 rounded-xl border border-input bg-input-bg px-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
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
  const [activeTab, setActiveTab] = useState<TabId>('resumen');;

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-action-alt" />
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
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === t.id
                ? 'rs-active-brand'
                : 'border-border bg-card text-muted-foreground rs-hover-brand hover:text-brand'
            }`}
          >
            {t.label}
          </button>
        ))}
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

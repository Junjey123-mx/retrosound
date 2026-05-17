'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes';
import { Database, Download } from 'lucide-react';
import { RoleGuard } from '@/components/guards/role-guard';
import { PageHeader }   from '@/components/ui/page-header';
import { Button }       from '@/components/ui/button';
import { Input }        from '@/components/ui/input';
import { Select }       from '@/components/ui/select';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { EmptyState }   from '@/components/ui/empty-state';
import { ErrorState }   from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type Row   = Record<string, unknown>;
type TabId = 'resumen' | 'ventas' | 'catalogo' | 'compras' | 'stock' | 'clientes' | 'vendidos' | 'ranking';

interface TabConfig { id: TabId; label: string }

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

const FILTER_TABS = TABS.map((t) => ({ value: t.id, label: t.label }));

// ─── Column label map ─────────────────────────────────────────────────────────

const COL_LABEL: Record<string, string> = {
  id_venta:                  'ID Venta',
  fecha_venta:               'Fecha de Venta',
  metodo_pago:               'Método de Pago',
  estado_venta:              'Estado',
  descuento_venta:           'Descuento Venta',
  id_cliente:                'ID Cliente',
  cliente:                   'Cliente',
  correo_cliente:            'Correo',
  telefono_cliente:          'Teléfono',
  direccion_cliente:         'Dirección',
  fecha_registro_cliente:    'Fecha de Registro',
  ventas_completadas:        'Ventas Completadas',
  empleado:                  'Empleado',
  empleado_responsable:      'Empleado Responsable',
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
  cantidad_vendida:          'Cantidad',
  precio_unitario_venta:     'Precio Unitario',
  descuento_detalle:         'Descuento Ítem',
  subtotal:                  'Subtotal',
  total_items:               'Ítems',
  total_bruto:               'Total Bruto',
  total_neto:                'Total Neto',
  iva_12:                    'IVA 12%',
  total:                     'Total con IVA',
  id_compra_proveedor:       'ID Compra',
  fecha_compra_proveedor:    'Fecha de Compra',
  estado_compra:             'Estado',
  nombre_proveedor:          'Proveedor',
  correo_proveedor:          'Correo del Proveedor',
  cantidad_comprada:         'Cantidad',
  costo_unitario_compra:     'Costo Unitario',
  costo_total:               'Costo Total',
  total_unidades:            'Unidades Vendidas',
  en_ventas:                 'Nº de Ventas',
  ingresos_generados:        'Ingresos Generados',
  precio_promedio_venta:     'Precio Promedio',
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

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportToCSV(data: Row[], filename: string) {
  if (!data.length) return;
  const cols   = Object.keys(data[0]);
  const escape = (v: string) =>
    v.includes(',') || v.includes('"') || v.includes('\n')
      ? `"${v.replace(/"/g, '""')}"` : v;
  const header = cols.map((c) => escape(colLabel(c))).join(',');
  const rows   = data.map((row) => cols.map((c) => escape(formatCell(row[c]))).join(','));
  const csv    = [header, ...rows].join('\n');
  const blob   = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Dynamic report table ─────────────────────────────────────────────────────

function ReportTable({ data }: { data: Row[] }) {
  if (!data.length) {
    return (
      <EmptyState
        icon={<Database className="h-6 w-6" />}
        title="Sin datos"
        description="No hay registros para los filtros seleccionados."
      />
    );
  }
  const cols = Object.keys(data[0]);
  return (
    <div className="rs-dash-section overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {cols.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {colLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="rs-table-row transition-colors hover:bg-muted/20">
              {cols.map((c) => {
                const raw     = formatCell(row[c]);
                const display = raw.length > 42 ? raw.slice(0, 40) + '…' : raw;
                return (
                  <td key={c} className="whitespace-nowrap px-4 py-2.5 text-sm text-foreground" title={raw}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {data.length} filas · Fuente: PostgreSQL
      </div>
    </div>
  );
}

// ─── Generic report section (no filters) ─────────────────────────────────────

function ReportSection({
  queryKey,
  queryFn,
  onData,
}: {
  queryKey: string[];
  queryFn: () => Promise<Row[]>;
  onData: (d: Row[]) => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => { if (data) onData(data); }, [data, onData]);

  if (isLoading) return <LoadingState variant="table" label="Ejecutando consulta SQL…" />;
  if (error)     return <ErrorState title="Error al ejecutar el reporte" error={error} />;

  return <>{data && <ReportTable data={data} />}</>;
}

// ─── Resumen Ventas (has estado filter) ───────────────────────────────────────

function ResumenVentasTab({ onData }: { onData: (d: Row[]) => void }) {
  const [estado, setEstado] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey:  ['reportes', 'resumen', estado],
    queryFn:   () => reportesService.resumenVentas(estado),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => { if (data) onData(data); }, [data, onData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          id="estado-resumen"
          label="Filtrar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-48"
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </Select>
        {data && (
          <span className="mb-1 text-xs text-muted-foreground">
            {data.length} registros
          </span>
        )}
      </div>

      {isLoading && <LoadingState variant="table" label="Consultando vista SQL…" />}
      {error     && <ErrorState title="Error al cargar resumen de ventas" error={error} />}
      {data      && <ReportTable data={data} />}
    </div>
  );
}

// ─── Más Vendidos (has HAVING min filter) ─────────────────────────────────────

function MasVendidosTab({ onData }: { onData: (d: Row[]) => void }) {
  const [min, setMin] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey:  ['reportes', 'mas-vendidos', min],
    queryFn:   () => reportesService.productosMasVendidos(min),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => { if (data) onData(data); }, [data, onData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          id="min-vendidos"
          label="Mínimo unidades vendidas (HAVING)"
          type="number"
          min={1}
          value={min}
          onChange={(e) => setMin(Math.max(1, Number(e.target.value)))}
          className="w-48"
        />
        {data && (
          <span className="mb-1 text-xs text-muted-foreground">
            {data.length} productos
          </span>
        )}
      </div>

      {isLoading && <LoadingState variant="table" label="Ejecutando GROUP BY / HAVING…" />}
      {error     && <ErrorState title="Error al cargar productos más vendidos" error={error} />}
      {data      && <ReportTable data={data} />}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ReportesContent() {
  const [activeTab, setActiveTab]   = useState<TabId>('resumen');
  const [exportData, setExportData] = useState<Row[]>([]);

  const handleData = useCallback((d: Row[]) => setExportData(d), []);

  useEffect(() => { setExportData([]); }, [activeTab]);

  return (
    <main className="space-y-6 p-6 sm:p-8">
      <PageHeader
        title="Reportes SQL"
        description="Consulta reportes operativos y exporta datos de RetroSound"
        icon={<Database className="h-5 w-5" />}
        action={
          <Button
            size="sm"
            disabled={!exportData.length}
            onClick={() => exportToCSV(exportData, `retrosound-${activeTab}.csv`)}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Exportar CSV
            {exportData.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold leading-none">
                {exportData.length}
              </span>
            )}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Fuente</p>
            <p className="text-sm font-semibold text-foreground">Datos reales de PostgreSQL</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Filtros</p>
            <p className="text-sm font-semibold text-foreground">Por estado y parámetros SQL</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Exportación</p>
            <p className="text-sm font-semibold text-foreground">CSV con BOM UTF-8</p>
          </CardContent>
        </Card>
      </div>

      <FilterTabs
        tabs={FILTER_TABS}
        active={activeTab}
        onChange={(v) => setActiveTab(v as TabId)}
      />

      <div className="space-y-4">
        {activeTab === 'resumen'  && <ResumenVentasTab onData={handleData} />}
        {activeTab === 'vendidos' && <MasVendidosTab   onData={handleData} />}
        {activeTab === 'ventas'   && (
          <ReportSection
            queryKey={['reportes', 'ventas-detalle']}
            queryFn={reportesService.ventasDetalle}
            onData={handleData}
          />
        )}
        {activeTab === 'catalogo' && (
          <ReportSection
            queryKey={['reportes', 'productos-catalogo']}
            queryFn={reportesService.productosCatalogo}
            onData={handleData}
          />
        )}
        {activeTab === 'compras' && (
          <ReportSection
            queryKey={['reportes', 'compras-proveedor']}
            queryFn={reportesService.comprasProveedor}
            onData={handleData}
          />
        )}
        {activeTab === 'stock' && (
          <ReportSection
            queryKey={['reportes', 'productos-bajo-stock']}
            queryFn={reportesService.productosStockBajo}
            onData={handleData}
          />
        )}
        {activeTab === 'clientes' && (
          <ReportSection
            queryKey={['reportes', 'clientes-frecuentes']}
            queryFn={reportesService.clientesFrecuentes}
            onData={handleData}
          />
        )}
        {activeTab === 'ranking' && (
          <ReportSection
            queryKey={['reportes', 'ranking-ingresos']}
            queryFn={reportesService.rankingIngresos}
            onData={handleData}
          />
        )}
      </div>
    </main>
  );
}

export function ReportsPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_ventas', 'empleado_inventario']}>
      <ReportesContent />
    </RoleGuard>
  );
}

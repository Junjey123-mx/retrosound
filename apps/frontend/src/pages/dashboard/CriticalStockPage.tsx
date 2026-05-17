'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useStockCritico, useStockResumen } from '@/hooks/use-inventario';
import type { StockCriticoItem } from '@/types';
import { RoleGuard }    from '@/components/guards/role-guard';
import { PageHeader }   from '@/components/ui/page-header';
import { StatCard }     from '@/components/ui/stat-card';
import { DataTable }    from '@/components/ui/data-table';
import { Badge }        from '@/components/ui/badge';
import { SearchInput }  from '@/components/ui/search-input';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';
import { ROUTES }      from '@/lib/constants/routes';

// ─── helpers ──────────────────────────────────────────────────────────────────

function stockBadge(item: StockCriticoItem) {
  if (item.stockActual === 0 || item.estado === 'agotado') {
    return <Badge variant="danger">Agotado</Badge>;
  }
  return <Badge variant="warning">Bajo mínimo</Badge>;
}

function diferencia(item: StockCriticoItem) {
  return item.stockActual - item.stockMinimo;
}

const ESTADO_TABS = [
  { value: 'todos',        label: 'Todos'       },
  { value: 'agotado',      label: 'Agotados'    },
  { value: 'bajo_minimo',  label: 'Bajo mínimo' },
];

// ─── page content ─────────────────────────────────────────────────────────────

function StockCriticoContent() {
  const { data: stockData, isLoading: loadingStock, error: errorStock } = useStockCritico({ limit: 100 });
  const { data: resumen,   isLoading: loadingResumen }                  = useStockResumen();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todos');

  const items = stockData?.data ?? [];

  const filtered = useMemo(() => {
    let list = items;

    if (filterTab === 'agotado') {
      list = list.filter((i) => i.stockActual === 0 || i.estado === 'agotado');
    } else if (filterTab === 'bajo_minimo') {
      list = list.filter((i) => i.stockActual > 0 && i.estado !== 'agotado');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.titulo.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        (i.categoria ?? '').toLowerCase().includes(q) ||
        (i.formato ?? '').toLowerCase().includes(q) ||
        (i.proveedorPrincipal?.nombre ?? '').toLowerCase().includes(q),
      );
    }

    return list;
  }, [items, filterTab, search]);

  const tabCounts = useMemo(() => ({
    todos:       items.length,
    agotado:     items.filter((i) => i.stockActual === 0 || i.estado === 'agotado').length,
    bajo_minimo: items.filter((i) => i.stockActual > 0 && i.estado !== 'agotado').length,
  }), [items]);

  const columns = [
    {
      key: 'titulo',
      header: 'Producto',
      render: (i: StockCriticoItem) => (
        <span className="font-medium text-foreground">{i.titulo}</span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (i: StockCriticoItem) => (
        <span className="font-mono text-xs text-muted-foreground">{i.sku}</span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (i: StockCriticoItem) => (
        <span className="text-muted-foreground">{i.categoria ?? '—'}</span>
      ),
    },
    {
      key: 'formato',
      header: 'Formato',
      render: (i: StockCriticoItem) => (
        <span className="text-muted-foreground">{i.formato ?? '—'}</span>
      ),
    },
    {
      key: 'stockActual',
      header: 'Stock actual',
      className: 'text-right',
      render: (i: StockCriticoItem) => (
        <span className={`font-semibold ${i.stockActual === 0 ? 'text-danger' : 'text-warning'}`}>
          {i.stockActual}
        </span>
      ),
    },
    {
      key: 'stockMinimo',
      header: 'Stock mínimo',
      className: 'text-right',
      render: (i: StockCriticoItem) => (
        <span className="text-muted-foreground">{i.stockMinimo}</span>
      ),
    },
    {
      key: 'diferencia',
      header: 'Diferencia',
      className: 'text-right',
      render: (i: StockCriticoItem) => {
        const d = diferencia(i);
        return (
          <span className={`font-medium ${d < 0 ? 'text-danger' : 'text-warning'}`}>
            {d}
          </span>
        );
      },
    },
    {
      key: 'proveedor',
      header: 'Proveedor principal',
      render: (i: StockCriticoItem) => (
        <span className="text-muted-foreground">
          {i.proveedorPrincipal?.nombre ?? '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (i: StockCriticoItem) => stockBadge(i),
    },
  ];

  if (loadingStock) {
    return (
      <main className="space-y-6 p-6 sm:p-8">
        <PageHeader
          title="Stock crítico"
          description="Productos que necesitan atención de inventario"
          icon={<AlertTriangle className="h-5 w-5" />}
          backHref={ROUTES.dashboard.inventario}
          backLabel="Inventario"
        />
        <LoadingState variant="cards" label="Cargando resumen…" />
        <LoadingState variant="table" label="Cargando productos…" />
      </main>
    );
  }

  if (errorStock) {
    return (
      <main className="p-6 sm:p-8">
        <ErrorState title="Error al cargar stock crítico" error={errorStock} />
      </main>
    );
  }

  const totalRiesgo   = resumen?.stockCritico      ?? items.length;
  const agotados      = resumen?.agotados          ?? tabCounts.agotado;
  const bajoMinimo    = totalRiesgo - agotados;
  const difAcumulada  = items.reduce((acc, i) => acc + diferencia(i), 0);

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Stock crítico"
        description="Productos que necesitan atención de inventario"
        icon={<AlertTriangle className="h-5 w-5" />}
        backHref={ROUTES.dashboard.inventario}
        backLabel="Inventario"
      />

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total en riesgo"
          value={totalRiesgo}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
          description="Stock en o bajo mínimo"
        />
        <StatCard
          title="Agotados"
          value={agotados}
          icon={<Package className="h-5 w-5" />}
          tone="danger"
        />
        <StatCard
          title="Bajo mínimo"
          value={loadingResumen ? '…' : bajoMinimo}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
          description="Stock > 0 pero bajo umbral"
        />
        <StatCard
          title="Déficit acumulado"
          value={difAcumulada}
          icon={<Package className="h-5 w-5" />}
          tone="danger"
          description="Suma de diferencias negativas"
        />
      </div>

      {/* filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={ESTADO_TABS.map((t) => ({ ...t, count: tabCounts[t.value as keyof typeof tabCounts] }))}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por producto, SKU, categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            containerClassName="w-64"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title={search || filterTab !== 'todos' ? 'Sin resultados' : 'Sin productos críticos'}
          description={
            search || filterTab !== 'todos'
              ? 'Ajusta la búsqueda o los filtros.'
              : 'Todos los productos superan su stock mínimo.'
          }
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered}
          getRowKey={(i) => (i as StockCriticoItem).id}
        />
      )}

    </main>
  );
}

export function CriticalStockPage() {
  return (
    <RoleGuard allowed={['admin', 'empleado_inventario']}>
      <StockCriticoContent />
    </RoleGuard>
  );
}

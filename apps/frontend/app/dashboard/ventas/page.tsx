'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Receipt } from 'lucide-react';
import { useVentas } from '@/hooks/use-ventas';
import type { Venta } from '@/types';
import { PageHeader }   from '@/components/ui/page-header';
import { DataTable }    from '@/components/ui/data-table';
import { Badge }        from '@/components/ui/badge';
import { Button }       from '@/components/ui/button';
import { SearchInput }  from '@/components/ui/search-input';
import { FilterTabs }   from '@/components/ui/filter-tabs';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState }   from '@/components/ui/error-state';
import { EmptyState }   from '@/components/ui/empty-state';

// ─── helpers ──────────────────────────────────────────────────────────────────

function estadoVariant(estado: string) {
  if (estado === 'completada') return 'success'  as const;
  if (estado === 'pendiente')  return 'warning'  as const;
  if (estado === 'cancelada')  return 'danger'   as const;
  return 'muted' as const;
}

function formatQ(value: number) {
  return `Q${value.toFixed(2)}`;
}

function calcTotal(v: Venta): number | null {
  if (!v.detalles?.length) return null;
  const sub = v.detalles.reduce((s, d) => s + d.precioUnitario * d.cantidadVendida, 0);
  return v.descuento ? sub * (1 - v.descuento / 100) : sub;
}

function clienteLabel(v: Venta): string {
  if (v.cliente) return `${v.cliente.nombre} ${v.cliente.apellido}`;
  return `Cliente #${v.idCliente}`;
}

function fmtFecha(raw: string) {
  return String(raw).slice(0, 10);
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function VentasPage() {
  const { data: ventas, isLoading, error } = useVentas();

  const [search,    setSearch]    = useState('');
  const [filterTab, setFilterTab] = useState('todas');

  const tabCounts = useMemo(() => {
    const all = ventas ?? [];
    return {
      todas:      all.length,
      completada: all.filter((v) => v.estado === 'completada').length,
      pendiente:  all.filter((v) => v.estado === 'pendiente').length,
      cancelada:  all.filter((v) => v.estado === 'cancelada').length,
    };
  }, [ventas]);

  const filtered = useMemo(() => {
    let list = ventas ?? [];
    if (filterTab !== 'todas') list = list.filter((v) => v.estado === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          String(v.id).includes(q) ||
          clienteLabel(v).toLowerCase().includes(q) ||
          v.metodoPago.toLowerCase().includes(q) ||
          v.estado.toLowerCase().includes(q),
      );
    }
    return list;
  }, [ventas, filterTab, search]);

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (v: Venta) => (
        <span className="font-mono text-xs text-muted-foreground">#{v.id}</span>
      ),
    },
    {
      key: 'fechaVenta',
      header: 'Fecha',
      render: (v: Venta) => (
        <span className="text-foreground">{fmtFecha(v.fechaVenta)}</span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (v: Venta) => (
        <span className="font-medium text-foreground">{clienteLabel(v)}</span>
      ),
    },
    {
      key: 'metodoPago',
      header: 'Método',
      render: (v: Venta) => (
        <span className="capitalize text-muted-foreground">{v.metodoPago}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      className: 'text-center',
      render: (v: Venta) => (
        <Badge variant={estadoVariant(v.estado)}>{v.estado}</Badge>
      ),
    },
    {
      key: 'descuento',
      header: 'Descuento',
      className: 'text-right',
      render: (v: Venta) => (
        <span className="text-muted-foreground">
          {v.descuento ? `${v.descuento}%` : '—'}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      className: 'text-right',
      render: (v: Venta) => (
        <span className="text-muted-foreground">
          {v.detalles?.length ?? '—'}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (v: Venta) => {
        const t = calcTotal(v);
        return (
          <span className="font-medium text-foreground">
            {t !== null ? formatQ(t) : '—'}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-center',
      render: (v: Venta) => (
        <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
          <Link href={`/dashboard/ventas/${v.id}` as any}>
            <Eye className="h-3 w-3" />
            Ver
          </Link>
        </Button>
      ),
    },
  ];

  if (isLoading) return <div className="p-8"><LoadingState variant="table" label="Cargando ventas…" /></div>;
  if (error)     return <div className="p-8"><ErrorState title="Error al cargar ventas" error={error} /></div>;

  return (
    <main className="space-y-6 p-6 sm:p-8">

      <PageHeader
        title="Ventas"
        description="Consulta y administra las ventas de RetroSound"
        icon={<Receipt className="h-5 w-5" />}
        action={
          <Button size="sm" asChild>
            <Link href={"/dashboard/ventas/nueva" as any}>+ Nueva venta</Link>
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={[
            { value: 'todas',      label: 'Todas',       count: tabCounts.todas      },
            { value: 'completada', label: 'Completadas',  count: tabCounts.completada },
            { value: 'pendiente',  label: 'Pendientes',   count: tabCounts.pendiente  },
            { value: 'cancelada',  label: 'Canceladas',   count: tabCounts.cancelada  },
          ]}
          value={filterTab}
          onChange={setFilterTab}
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Buscar por ID, cliente, método…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            containerClassName="w-64"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla / estados */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title={search || filterTab !== 'todas' ? 'Sin resultados' : 'No hay ventas'}
          description={
            search || filterTab !== 'todas'
              ? 'Intenta ajustar la búsqueda o los filtros.'
              : 'Registra la primera venta del sistema.'
          }
          action={
            !search && filterTab === 'todas' ? (
              <Button size="sm" asChild>
                <Link href={"/dashboard/ventas/nueva" as any}>+ Nueva venta</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered}
          getRowKey={(v) => (v as Venta).id}
        />
      )}

    </main>
  );
}

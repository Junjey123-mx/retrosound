'use client';

import { useQuery } from '@tanstack/react-query';
import { ventasService } from '@/lib/services/ventas';
import { Receipt, ShoppingCart, Calendar, CreditCard, User } from 'lucide-react';
import type { Venta } from '@/types';

const ESTADO_BADGE: Record<string, string> = {
  pendiente:  'rs-badge-pendiente',
  completada: 'rs-badge-completada',
  cancelada:  'rs-badge-cancelada',
};

export default function VentasPage() {
  const { data: ventas, isLoading, error } = useQuery<Venta[]>({
    queryKey: ['ventas'],
    queryFn:  ventasService.getAll,
    staleTime: 60 * 1000,
  });

  return (
    <main className="p-6 sm:p-8 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-success" />
            Ventas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial y registro de ventas de RetroSound.
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Cargando historial de ventas…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el historial de ventas. Verifica tu sesión.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && ventas?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">Sin ventas registradas</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Aún no hay ventas en el sistema. Registra la primera venta desde la API.
          </p>
        </div>
      )}

      {/* Tabla de ventas */}
      {ventas && ventas.length > 0 && (
        <div className="rs-dash-section rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-soft">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1"><Receipt className="h-3.5 w-3.5 text-info" />ID</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-action-alt" />Fecha</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-info" />Cliente</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-success" />Método</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descuento</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ventas.map((v) => (
                  <tr key={v.id} className="rs-table-row">
                    <td className="px-4 py-3 font-mono text-muted-foreground">#{v.id}</td>
                    <td className="px-4 py-3 text-foreground">
                      {String(v.fechaVenta).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      Cliente #{v.idCliente}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{v.metodoPago}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGE[v.estado] ?? 'border border-border bg-background-soft text-muted-foreground'}`}>
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {v.descuento ? `${v.descuento}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {v.detalles?.length ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'} registradas
          </div>
        </div>
      )}
    </main>
  );
}

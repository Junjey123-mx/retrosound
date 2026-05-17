import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '@/lib/services/inventario';
import type { ConfirmarRecepcionDto } from '@/types';

interface RecepcionesQuery {
  search?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

interface StockQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export function useRecepciones(query: RecepcionesQuery = {}) {
  return useQuery({
    queryKey: ['inventario', 'recepciones', query],
    queryFn: () => inventarioService.getRecepciones(query),
    staleTime: 30_000,
  });
}

export function useRecepcion(id: number) {
  return useQuery({
    queryKey: ['inventario', 'recepciones', id],
    queryFn: () => inventarioService.getRecepcionById(id),
    enabled: id > 0,
    staleTime: 30_000,
  });
}

export function useConfirmarRecepcion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idDetalle, dto }: { idDetalle: number; dto: ConfirmarRecepcionDto }) =>
      inventarioService.confirmarRecepcion(idDetalle, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario', 'recepciones'] });
      queryClient.invalidateQueries({ queryKey: ['inventario', 'stock-critico'] });
      queryClient.invalidateQueries({ queryKey: ['inventario', 'stock-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['inventario', 'dashboard'] });
    },
  });
}

export function useStockCritico(query: StockQuery = {}) {
  return useQuery({
    queryKey: ['inventario', 'stock-critico', query],
    queryFn: () => inventarioService.getStockCritico(query),
    staleTime: 30_000,
  });
}

export function useStockResumen() {
  return useQuery({
    queryKey: ['inventario', 'stock-resumen'],
    queryFn: inventarioService.getStockResumen,
    staleTime: 30_000,
  });
}

export function useDashboardInventario() {
  return useQuery({
    queryKey: ['inventario', 'dashboard'],
    queryFn: inventarioService.getDashboardInventario,
    staleTime: 30_000,
  });
}

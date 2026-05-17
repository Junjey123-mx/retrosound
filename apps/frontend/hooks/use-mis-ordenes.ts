import { useQuery } from '@tanstack/react-query';
import { misOrdenesService } from '@/lib/services/mis-ordenes';

export function useMisOrdenes() {
  return useQuery({
    queryKey: ['mis-ordenes'],
    queryFn: () => misOrdenesService.getAll(),
    staleTime: 30_000,
  });
}

export function useMisOrden(id: number) {
  return useQuery({
    queryKey: ['mis-ordenes', id],
    queryFn: () => misOrdenesService.getOne(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

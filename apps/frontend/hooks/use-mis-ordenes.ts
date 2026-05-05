import { useQuery } from '@tanstack/react-query';
import { misOrdenesService } from '@/lib/services/mis-ordenes';

export function useMisOrdenes() {
  return useQuery({
    queryKey: ['mis-ordenes'],
    queryFn: () => misOrdenesService.getAll(),
    staleTime: 30_000,
  });
}

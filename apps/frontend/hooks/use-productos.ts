import { useQuery } from '@tanstack/react-query';
import { productosService } from '@/lib/services/productos';

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: productosService.getAll,
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosService.getOne(id),
    enabled: !!id,
  });
}

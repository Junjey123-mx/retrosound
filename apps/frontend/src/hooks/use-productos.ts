import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosService } from '@/lib/services/productos';
import type { Producto } from '@/types';

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: productosService.getAll,
  });
}

export function useClienteProductos() {
  return useQuery({
    queryKey: ['cliente-productos'],
    queryFn: productosService.getAllWithAlbumCovers,
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosService.getOne(id),
    enabled: !!id,
  });
}

export function useClienteProducto(id: number) {
  return useQuery({
    queryKey: ['cliente-producto', id],
    queryFn: () => productosService.getOneWithAlbumCover(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Producto>) => productosService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Producto> }) =>
      productosService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useDeactivateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}

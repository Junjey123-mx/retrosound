import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '@/lib/services/carrito';

export function useCarrito() {
  return useQuery({
    queryKey: ['carrito'],
    queryFn: carritoService.get,
    retry: false,
    staleTime: 60_000,
  });
}

export function useCarritoItemCount() {
  const { data } = useCarrito();
  return data?.items.reduce((sum, item) => sum + item.cantidad, 0) ?? 0;
}

export function useAddToCarrito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, cantidad }: { idProducto: number; cantidad: number }) =>
      carritoService.addItem(idProducto, cantidad),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carrito'] }),
  });
}

export function useRemoveFromCarrito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idCarritoItem: number) => carritoService.removeItem(idCarritoItem),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carrito'] }),
  });
}

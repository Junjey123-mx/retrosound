import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ventasService } from '@/lib/services/ventas';
import type { Venta } from '@/types';

export interface CreateVentaDto {
  fechaVenta: string;
  descuento?: number;
  metodoPago: string;
  idCliente: number;
  detalles: {
    idProducto: number;
    cantidadVendida: number;
    precioUnitario: number;
  }[];
}

export function useVentas() {
  return useQuery<Venta[]>({
    queryKey: ['ventas'],
    queryFn: ventasService.getAll,
    staleTime: 60_000,
  });
}

export function useVenta(id: number) {
  return useQuery<Venta>({
    queryKey: ['ventas', id],
    queryFn: () => ventasService.getOne(id),
    enabled: id > 0,
    staleTime: 60_000,
  });
}

export function useCreateVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVentaDto) => ventasService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ventas'] }),
  });
}

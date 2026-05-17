import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proveedoresService } from '@/lib/services/proveedores';
import type { Proveedor } from '@/types';

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: proveedoresService.getAll,
  });
}

export function useCreateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Proveedor>) => proveedoresService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useUpdateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Proveedor> }) =>
      proveedoresService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useDeactivateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => proveedoresService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

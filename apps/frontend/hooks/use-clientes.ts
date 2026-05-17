import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesService, type UpdateClienteDto } from '@/lib/services/clientes';
import type { Cliente } from '@/types';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getAll,
    staleTime: 60_000,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Cliente>) => clientesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) =>
      clientesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useDeactivateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useClienteMe() {
  return useQuery({
    queryKey: ['cliente-me'],
    queryFn: () => clientesService.getMe(),
    staleTime: 60_000,
  });
}

export function useUpdateClienteMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateClienteDto) => clientesService.updateMe(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cliente-me'] }),
  });
}

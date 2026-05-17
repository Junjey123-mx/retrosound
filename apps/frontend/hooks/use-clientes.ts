import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesService, type UpdateClienteDto } from '@/lib/services/clientes';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getAll,
    staleTime: 60_000,
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

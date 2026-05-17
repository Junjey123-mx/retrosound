import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usuariosService,
  type CreateUsuarioDto,
  type UpdateUsuarioDto,
} from '@/lib/services/usuarios';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.getAll,
    staleTime: 60_000,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUsuarioDto) => usuariosService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioDto }) =>
      usuariosService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useDeactivateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

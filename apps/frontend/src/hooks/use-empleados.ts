import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  empleadosService,
  type CreateEmpleadoDto,
  type UpdateEmpleadoDto,
} from '@/lib/services/empleados';

export function useEmpleados() {
  return useQuery({
    queryKey: ['empleados'],
    queryFn: empleadosService.getAll,
    staleTime: 60_000,
  });
}

export function useCreateEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmpleadoDto) => empleadosService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

export function useUpdateEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmpleadoDto }) =>
      empleadosService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

export function useDeactivateEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => empleadosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados'] }),
  });
}

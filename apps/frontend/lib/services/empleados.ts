import { apiClient } from '../api/client';
import type { EmpleadoAdmin } from '@/types';

export interface CreateEmpleadoDto {
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  fechaContratacion: string;
}

export interface UpdateEmpleadoDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  fechaContratacion?: string;
}

export const empleadosService = {
  getAll: async () => {
    const res = await apiClient.get<{ data: EmpleadoAdmin[] } | EmpleadoAdmin[]>('/empleados');
    return Array.isArray(res) ? res : (res as { data: EmpleadoAdmin[] }).data ?? [];
  },
  getOne: (id: number) => apiClient.get<EmpleadoAdmin>(`/empleados/${id}`),
  create: (dto: CreateEmpleadoDto) => apiClient.post<EmpleadoAdmin>('/empleados', dto),
  update: (id: number, dto: UpdateEmpleadoDto) => apiClient.patch<EmpleadoAdmin>(`/empleados/${id}`, dto),
  remove: (id: number) => apiClient.delete<EmpleadoAdmin>(`/empleados/${id}`),
};

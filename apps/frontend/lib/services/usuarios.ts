import { apiClient } from '../api/client';
import type { UsuarioAdmin } from '@/types';

export interface CreateUsuarioDto {
  correo: string;
  contrasena: string;
  rol: string;
}

export interface UpdateUsuarioDto {
  rol?: string;
  estado?: string;
}

export const usuariosService = {
  getAll: async () => {
    const res = await apiClient.get<{ data: UsuarioAdmin[] } | UsuarioAdmin[]>('/usuarios');
    return Array.isArray(res) ? res : (res as { data: UsuarioAdmin[] }).data ?? [];
  },
  getOne: (id: number) => apiClient.get<UsuarioAdmin>(`/usuarios/${id}`),
  create: (dto: CreateUsuarioDto) => apiClient.post<UsuarioAdmin>('/usuarios', dto),
  update: (id: number, dto: UpdateUsuarioDto) => apiClient.patch<UsuarioAdmin>(`/usuarios/${id}`, dto),
  remove: (id: number) => apiClient.delete<UsuarioAdmin>(`/usuarios/${id}`),
};

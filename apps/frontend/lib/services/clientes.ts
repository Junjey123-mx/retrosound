import { apiClient } from '../api/client';
import type { Cliente } from '@/types';

export const clientesService = {
  getAll: () => apiClient.get<Cliente[]>('/clientes'),
  getOne: (id: number) => apiClient.get<Cliente>(`/clientes/${id}`),
  create: (data: Partial<Cliente>) => apiClient.post<Cliente>('/clientes', data),
  update: (id: number, data: Partial<Cliente>) => apiClient.patch<Cliente>(`/clientes/${id}`, data),
  remove: (id: number) => apiClient.delete<void>(`/clientes/${id}`),
};

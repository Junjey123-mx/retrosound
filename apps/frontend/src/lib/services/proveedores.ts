import { apiClient } from '../api/client';
import type { Proveedor } from '@/types';

export const proveedoresService = {
  getAll: () => apiClient.get<Proveedor[]>('/proveedores'),
  getOne: (id: number) => apiClient.get<Proveedor>(`/proveedores/${id}`),
  create: (data: Partial<Proveedor>) => apiClient.post<Proveedor>('/proveedores', data),
  update: (id: number, data: Partial<Proveedor>) =>
    apiClient.patch<Proveedor>(`/proveedores/${id}`, data),
  remove: (id: number) => apiClient.delete<Proveedor>(`/proveedores/${id}`),
};

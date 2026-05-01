import { apiClient } from '../api/client';
import type { Producto } from '@/types';

export const productosService = {
  getAll: () => apiClient.get<Producto[]>('/productos'),
  getOne: (id: number) => apiClient.get<Producto>(`/productos/${id}`),
  create: (data: Partial<Producto>) => apiClient.post<Producto>('/productos', data),
  update: (id: number, data: Partial<Producto>) => apiClient.patch<Producto>(`/productos/${id}`, data),
  remove: (id: number) => apiClient.delete<void>(`/productos/${id}`),
};

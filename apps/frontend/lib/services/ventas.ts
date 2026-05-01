import { apiClient } from '../api/client';
import type { Venta, CreateVentaPayload } from '@/types';

export const ventasService = {
  getAll: () => apiClient.get<Venta[]>('/ventas'),
  getOne: (id: number) => apiClient.get<Venta>(`/ventas/${id}`),
  create: (data: CreateVentaPayload) => apiClient.post<Venta>('/ventas', data),
};

import { apiClient } from '../api/client';

export interface OrdenItem {
  tituloProducto: string;
  formato: string;
  artistas: string[];
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export interface Orden {
  idVenta: number;
  fechaVenta: string;
  estadoVenta: 'pendiente' | 'completada' | 'cancelada';
  metodoPago: string;
  total: number;
  items: OrdenItem[];
}

export interface OrdenDetalle {
  idVenta: number;
  fechaVenta: string;
  estadoVenta: 'pendiente' | 'completada' | 'cancelada';
  metodoPago: string;
  descuentoVenta: number;
  totalBruto: number;
  totalNeto: number;
  iva: number;
  totalConIva: number;
  items: OrdenItem[];
}

export const misOrdenesService = {
  getAll: () => apiClient.get<Orden[]>('/mis-ordenes'),
  getOne: (id: number) => apiClient.get<OrdenDetalle>(`/mis-ordenes/${id}`),
};

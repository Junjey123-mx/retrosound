import { apiClient } from '../api/client';

export interface CarritoItem {
  idCarritoItem: number;
  idProducto: number;
  titulo: string;
  estadoProducto: string;
  stockActual: number;
  precioVenta: number;
  cantidad: number;
  precioUnitarioSnapshot: number;
  subtotal: number;
  fechaAgregado: string;
}

export interface Carrito {
  idCarrito: number | null;
  estado: string | null;
  items: CarritoItem[];
  subtotal: number;
}

export const carritoService = {
  get: () => apiClient.get<Carrito>('/carrito'),
  addItem: (idProducto: number, cantidad: number) =>
    apiClient.post<Carrito>('/carrito/items', { idProducto, cantidad }),
  updateItem: (idCarritoItem: number, cantidad: number) =>
    apiClient.patch<CarritoItem>(`/carrito/items/${idCarritoItem}`, { cantidad }),
  removeItem: (idCarritoItem: number) =>
    apiClient.delete<{ message: string }>(`/carrito/items/${idCarritoItem}`),
  cancelar: () =>
    apiClient.delete<{ message: string; idCarrito: number }>('/carrito'),
};

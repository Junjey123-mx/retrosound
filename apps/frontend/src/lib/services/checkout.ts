import { apiClient } from '../api/client';

export interface CheckoutPayload {
  metodoPago: string;
  descuento?: number;
}

export interface CheckoutResponse {
  mensaje: string;
  idVenta: number;
  fecha: string;
  metodoPago: string;
  estado: string;
  cliente: { id: number; nombre: string; correo: string | null } | null;
  items: {
    idProducto: number;
    titulo: string;
    sku: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
  }[];
  recibo: {
    subtotal: number;
    descuento: number;
    totalNeto: number;
    iva12: number;
    total: number;
  };
}

export const checkoutService = {
  create: (payload: CheckoutPayload) =>
    apiClient.post<CheckoutResponse>('/checkout', payload),
};

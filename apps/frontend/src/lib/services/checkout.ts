import { apiClient } from '../api/client';

export interface CheckoutPayload {
  metodoPago: string;
  descuento?: number;
}

export interface CheckoutResponse {
  message: string;
  venta: {
    idVenta: number;
    metodoPago: string;
    recibo: {
      subtotal: number;
      descuentoVenta: number;
      totalNeto: number;
      iva12: number;
      total: number;
    };
  };
}

export const checkoutService = {
  create: (payload: CheckoutPayload) =>
    apiClient.post<CheckoutResponse>('/checkout', payload),
};

import { apiClient } from '../api/client';

type Row = Record<string, unknown>;

export const reportesService = {
  ventasDetalle: () =>
    apiClient.get<Row[]>('/reportes/ventas-detalle'),

  productosCatalogo: () =>
    apiClient.get<Row[]>('/reportes/productos-catalogo'),

  comprasProveedor: () =>
    apiClient.get<Row[]>('/reportes/compras-proveedor'),

  productosStockBajo: () =>
    apiClient.get<Row[]>('/reportes/productos-bajo-stock'),

  clientesFrecuentes: () =>
    apiClient.get<Row[]>('/reportes/clientes-frecuentes'),

  productosMasVendidos: (min = 1) =>
    apiClient.get<Row[]>(`/reportes/productos-mas-vendidos?min=${min}`),

  rankingIngresos: () =>
    apiClient.get<Row[]>('/reportes/ranking-ingresos'),

  resumenVentas: (estado = '') =>
    apiClient.get<Row[]>(`/reportes/resumen-ventas${estado ? `?estado=${estado}` : ''}`),
};

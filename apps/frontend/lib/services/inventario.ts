import { apiClient } from '../api/client';
import type {
  RecepcionInventario,
  ConfirmarRecepcionDto,
  StockCriticoItem,
  StockResumen,
  DashboardInventarioResponse,
} from '@/types';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ConfirmarRecepcionResult {
  idDetalleCompra: number;
  cantidadRecibida: number;
  nuevoStock: number;
  estadoCompra: string;
  mensaje: string;
}

interface RecepcionesQuery {
  search?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

interface StockQuery {
  search?: string;
  page?: number;
  limit?: number;
}

function buildQs(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const inventarioService = {
  getRecepciones: (query: RecepcionesQuery = {}) =>
    apiClient.get<PaginatedResponse<RecepcionInventario>>(
      `/inventario/recepciones${buildQs({ search: query.search, estado: query.estado, page: query.page, limit: query.limit })}`,
    ),

  getRecepcionById: (id: number) =>
    apiClient.get<RecepcionInventario>(`/inventario/recepciones/${id}`),

  confirmarRecepcion: (idDetalle: number, dto: ConfirmarRecepcionDto) =>
    apiClient.patch<ConfirmarRecepcionResult>(
      `/inventario/recepciones/${idDetalle}/confirmar`,
      dto,
    ),

  getStockCritico: (query: StockQuery = {}) =>
    apiClient.get<PaginatedResponse<StockCriticoItem>>(
      `/inventario/stock-critico${buildQs({ search: query.search, page: query.page, limit: query.limit })}`,
    ),

  getStockResumen: () =>
    apiClient.get<StockResumen>('/inventario/stock-resumen'),

  getDashboardInventario: () =>
    apiClient.get<DashboardInventarioResponse>('/dashboard/inventario'),
};

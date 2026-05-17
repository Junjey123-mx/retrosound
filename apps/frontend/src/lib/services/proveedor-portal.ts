import { apiClient } from '../api/client';
import type {
  ProveedorMe,
  ProveedorDashboard,
  ProveedorProducto,
  UpdateProveedorProductoDto,
  UpdateProveedorProductoImagenDto,
  ProveedorEntrega,
  RegistrarEntregaProveedorDto,
  UpdateProveedorPerfilDto,
} from '@/types';

export interface PaginatedProveedorProductos {
  data: ProveedorProducto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PaginatedProveedorEntregas {
  data: ProveedorEntrega[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ProductosQuery {
  search?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface EntregasQuery {
  estado?: string;
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

export const proveedorPortalService = {
  getMe: () =>
    apiClient.get<ProveedorMe>('/proveedor/me'),

  getDashboard: () =>
    apiClient.get<ProveedorDashboard>('/proveedor/me/dashboard'),

  getProductos: (query: ProductosQuery = {}) =>
    apiClient.get<PaginatedProveedorProductos>(
      `/proveedor/me/productos${buildQs({
        search: query.search,
        estado: query.estado,
        page: query.page,
        limit: query.limit,
      })}`,
    ),

  getProductoById: (id: number) =>
    apiClient.get<ProveedorProducto>(`/proveedor/me/productos/${id}`),

  updateProducto: (id: number, dto: UpdateProveedorProductoDto) =>
    apiClient.patch<ProveedorProducto & { mensaje: string }>(
      `/proveedor/me/productos/${id}`,
      dto,
    ),

  updateProductoImagen: (id: number, dto: UpdateProveedorProductoImagenDto) =>
    apiClient.patch<{
      idProducto: number;
      titulo: string;
      imagenUrl: string | null;
      imagenPublicId: string | null;
      mensaje: string;
    }>(`/proveedor/me/productos/${id}/imagen`, dto),

  getEntregas: (query: EntregasQuery = {}) =>
    apiClient.get<PaginatedProveedorEntregas>(
      `/proveedor/me/entregas${buildQs({
        estado: query.estado,
        page: query.page,
        limit: query.limit,
      })}`,
    ),

  getEntregaById: (id: number) =>
    apiClient.get<ProveedorEntrega>(`/proveedor/me/entregas/${id}`),

  registrarEntrega: (dto: RegistrarEntregaProveedorDto) =>
    apiClient.post<{
      idCompra: number;
      estado: string;
      producto: { id: number; titulo: string; sku: string };
      cantidadReportada: number;
      costoUnitario: number;
    }>('/proveedor/me/entregas', dto),

  getPerfil: () =>
    apiClient.get<ProveedorMe>('/proveedor/me/perfil'),

  updatePerfil: (dto: UpdateProveedorPerfilDto) =>
    apiClient.patch<ProveedorMe & { mensaje: string }>('/proveedor/me/perfil', dto),
};

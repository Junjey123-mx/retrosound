import { apiClient } from '../api/client';
import type { Producto } from '@/types';
import {
  enrichProductWithAlbumCover,
  enrichProductsWithAlbumCovers,
} from './itunes';

type ProductoApi = Producto & {
  precio_venta?: number | string;
  stock_actual?: number;
  stock_minimo?: number;
  codigo_sku?: string;
  estado_producto?: Producto['estado'];
  anio_lanzamiento?: number;
  fecha_inactivacion?: string;
  id_categoria?: number;
  id_formato?: number;
  imagen_url?: string;
};

function normalizeProducto(producto: ProductoApi): Producto {
  return {
    ...producto,
    anioLanzamiento: producto.anioLanzamiento ?? producto.anio_lanzamiento,
    precioVenta: Number(producto.precioVenta ?? producto.precio_venta ?? 0),
    stockActual: producto.stockActual ?? producto.stock_actual ?? 0,
    stockMinimo: producto.stockMinimo ?? producto.stock_minimo ?? 0,
    codigoSku: producto.codigoSku ?? producto.codigo_sku ?? '',
    estado: producto.estado ?? producto.estado_producto ?? 'activo',
    fechaInactivacion: producto.fechaInactivacion ?? producto.fecha_inactivacion,
    idCategoria: producto.idCategoria ?? producto.id_categoria ?? 0,
    idFormato: producto.idFormato ?? producto.id_formato ?? 0,
    imagenUrl: producto.imagenUrl ?? producto.imagen_url ?? producto.imagen,
  };
}

export const productosService = {
  getAll: async () => {
    const productos = await apiClient.get<ProductoApi[]>('/productos');
    return productos.map(normalizeProducto);
  },
  getOne: async (id: number) => {
    const producto = await apiClient.get<ProductoApi>(`/productos/${id}`);
    return normalizeProducto(producto);
  },
  getAllWithAlbumCovers: async () => {
    const productos = await productosService.getAll();
    return enrichProductsWithAlbumCovers(productos);
  },
  getOneWithAlbumCover: async (id: number) => {
    const producto = await productosService.getOne(id);
    return enrichProductWithAlbumCover(producto);
  },
  create: (data: Partial<Producto>) => apiClient.post<Producto>('/productos', data),
  update: (id: number, data: Partial<Producto>) => apiClient.patch<Producto>(`/productos/${id}`, data),
  remove: (id: number) => apiClient.delete<void>(`/productos/${id}`),
};

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoGeneral = 'activo' | 'inactivo';
export type EstadoProducto = 'activo' | 'inactivo' | 'agotado' | 'descontinuado';
export type EstadoUsuario = 'activo' | 'bloqueado' | 'inactivo';
export type RolUsuario = 'admin' | 'empleado' | 'cliente' | 'proveedor';
export type EstadoVenta = 'pendiente' | 'completada' | 'cancelada';
export type EstadoCompra = 'pendiente' | 'recibida' | 'cancelada';

// ─── Catálogos ────────────────────────────────────────────────────────────────

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: EstadoGeneral;
}

export interface Formato {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: EstadoGeneral;
}

export interface GeneroMusical {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: EstadoGeneral;
}

export interface Artista {
  id: number;
  nombre: string;
  paisOrigen?: string;
  anioInicio?: number;
  estado: EstadoGeneral;
}

// ─── Entidades principales ────────────────────────────────────────────────────

export interface Producto {
  id: number;
  titulo: string;
  descripcion?: string;
  anioLanzamiento?: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  codigoSku: string;
  estado: EstadoProducto;
  imagen?: string;
  imagenUrl?: string;
  fechaInactivacion?: string;
  idCategoria: number;
  idFormato: number;
  categoria?: Categoria;
  formato?: Formato;
  artistas?: { artista: Artista }[];
  generos?: { generoMusical: GeneroMusical }[];
}

export interface AlbumSearchResult {
  externalId: number;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  genre: string;
  externalUrl: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fechaRegistro: string;
  estado: EstadoGeneral;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  fechaContratacion: string;
  estado: EstadoGeneral;
}

export interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  nombreContacto?: string;
  estado: EstadoGeneral;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

// ─── Ventas ───────────────────────────────────────────────────────────────────

export interface DetalleVenta {
  idProducto: number;
  cantidadVendida: number;
  precioUnitario: number;
  descuentoDetalle?: number;
  producto?: Producto;
}

export interface Venta {
  id: number;
  fechaVenta: string;
  descuento: number;
  metodoPago: string;
  estado: EstadoVenta;
  idCliente: number;
  idEmpleado: number;
  cliente?: Cliente;
  empleado?: Empleado;
  detalles?: DetalleVenta[];
}

export interface CreateVentaPayload {
  fechaVenta: string;
  descuento?: number;
  metodoPago: string;
  idCliente: number;
  idEmpleado: number;
  detalles: DetalleVenta[];
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoGeneral = 'activo' | 'inactivo';
export type EstadoProducto = 'activo' | 'inactivo' | 'agotado' | 'descontinuado';
export type EstadoUsuario = 'activo' | 'bloqueado' | 'inactivo';
export type RolUsuario = 'admin' | 'empleado_ventas' | 'empleado_inventario' | 'cliente' | 'proveedor';
export type EstadoVenta = 'pendiente' | 'completada' | 'cancelada';
export type EstadoCompra = 'pendiente' | 'recibida' | 'parcial' | 'cancelada';

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

export interface UsuarioAdmin extends Usuario {
  fechaInactivacion?: string | null;
  idCliente?: number | null;
  idEmpleado?: number | null;
  idProveedor?: number | null;
  cliente?: { id: number; nombre: string; apellido: string; correo?: string } | null;
  empleado?: { id: number; nombre: string; apellido: string } | null;
  proveedor?: { id: number; nombre: string } | null;
}

export interface EmpleadoAdmin extends Empleado {
  fechaInactivacion?: string | null;
  usuario?: { id: number; correo: string; rol: string; estado: string } | null;
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
  idEmpleado?: number;
  detalles: DetalleVenta[];
}

// ─── Inventario ───────────────────────────────────────────────────────────────

export interface RecepcionDetalle {
  id: number;
  cantidadComprada: number;
  cantidadRecibida: number | null;
  costoUnitario: number;
  producto: {
    id: number;
    titulo: string;
    sku: string;
    stockActual: number;
    stockMinimo: number;
  } | null;
}

export interface RecepcionInventario {
  id: number;
  fecha: string;
  estado: EstadoCompra;
  proveedor: { id: number; nombre: string } | null;
  empleado: { id: number; nombre: string } | null;
  detalles: RecepcionDetalle[];
}

export interface ConfirmarRecepcionDto {
  cantidadRecibida: number;
}

export interface StockCriticoItem {
  id: number;
  titulo: string;
  sku: string;
  stockActual: number;
  stockMinimo: number;
  estado: string;
  categoria: string;
  formato: string;
  proveedorPrincipal: { id: number; nombre: string | null } | null;
}

export interface StockResumen {
  totalProductos: number;
  stockCritico: number;
  agotados: number;
  stockSuficiente: number;
  proveedoresPrincipales: number;
}

export interface DashboardInventarioStats {
  productosActivos: number;
  stockCritico: number;
  productosAgotados: number;
  proveedoresActivos: number;
  recepcionesPendientes: number;
}

export interface DashboardInventarioResponse {
  stats: DashboardInventarioStats;
  recentItems: {
    stockCriticoItems: Array<{ idProducto: number; titulo: string; stockActual: number; stockMinimo: number }>;
    recepcionesRecientes: Array<{ idCompra: number; fecha: string; estado: string; proveedor: string | null }>;
    productosRecientes: Array<{ idProducto: number; titulo: string; sku: string; stockActual: number; precioVenta: number }>;
  };
}

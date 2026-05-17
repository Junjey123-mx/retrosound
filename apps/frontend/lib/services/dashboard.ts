import { apiClient } from '../api/client';

export interface AdminDashboardStats {
  productos_activos:       number;
  productos_agotados:      number;
  productos_stock_critico: number;
  ventas_completadas:      number;
  compras_pendientes:      number;
  total_vendido_mes:       string | number;
  usuarios_activos?:       number;
  proveedores_activos?:    number;
}

export interface DashboardAlertaStock {
  id_producto:      number;
  titulo_producto:  string;
  codigo_sku:       string;
  stock_actual:     number;
  stock_minimo:     number;
  nombre_categoria: string;
  nombre_formato:   string;
}

export interface DashboardCompra {
  id_compra_proveedor:    number;
  fecha_compra_proveedor: string;
  nombre_proveedor:       string;
  empleado:               string;
  num_productos:          number;
}

export interface DashboardVenta {
  id_venta:     number;
  fecha_venta:  string;
  estado_venta: string;
  metodo_pago:  string;
  cliente:      string;
  total_neto:   string | number;
}

export interface AdminDashboardResponse {
  stats:             AdminDashboardStats;
  alertasStock:      DashboardAlertaStock[];
  comprasPendientes: DashboardCompra[];
  ventasRecientes:   DashboardVenta[];
}

export const dashboardService = {
  getAdminDashboard: () => apiClient.get<AdminDashboardResponse>('/dashboard/admin'),
};

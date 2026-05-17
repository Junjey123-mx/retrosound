export const ROUTES = {
  public: {
    home: '/',
    login: '/login',
    registro: '/registro',
  },
  cliente: {
    tienda: '/tienda',
    carrito: '/carrito',
    misOrdenes: '/mis-ordenes',
    perfil: '/perfil',
  },
  dashboard: {
    root: '/dashboard',
    productos: '/dashboard/productos',
    ventas: '/dashboard/ventas',
    ventasNueva: '/dashboard/ventas/nueva',
    clientes: '/dashboard/clientes',
    proveedores: '/dashboard/proveedores',
    inventario: '/dashboard/inventario',
    inventarioRecepciones: '/dashboard/inventario/recepciones',
    inventarioStock: '/dashboard/inventario/stock-critico',
    usuarios: '/dashboard/usuarios',
    empleados: '/dashboard/empleados',
    reportes: '/dashboard/reportes',
    perfil: '/dashboard/perfil',
  },
  proveedor: {
    portal: '/proveedor',
    productos: '/proveedor/productos',
    entregas: '/proveedor/entregas',
    perfil: '/proveedor/perfil',
  },
} as const;

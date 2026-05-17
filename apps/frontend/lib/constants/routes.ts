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
    proveedores: '/dashboard/proveedores',
    reportes: '/dashboard/reportes',
    perfil: '/dashboard/perfil',
  },
  proveedor: {
    portal: '/proveedor',
  },
} as const;

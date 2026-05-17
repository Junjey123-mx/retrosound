import { ROUTES } from './routes';
import { ROLES } from '../auth/roles';

export interface NavItem {
  href: string;
  label: string;
}

export const ADMIN_NAV: NavItem[] = [
  { href: ROUTES.dashboard.root,               label: 'Inicio'      },
  { href: ROUTES.dashboard.productos,          label: 'Productos'   },
  { href: ROUTES.dashboard.ventas,             label: 'Ventas'      },
  { href: ROUTES.dashboard.clientes,           label: 'Clientes'    },
  { href: ROUTES.dashboard.proveedores,        label: 'Proveedores' },
  { href: ROUTES.dashboard.inventario,         label: 'Inventario'  },
  { href: ROUTES.dashboard.usuarios,           label: 'Usuarios'    },
  { href: ROUTES.dashboard.empleados,          label: 'Empleados'   },
  { href: ROUTES.dashboard.reportes,           label: 'Reportes'    },
];

export const EMPLEADO_VENTAS_NAV: NavItem[] = [
  { href: ROUTES.dashboard.ventas,             label: 'Inicio'      },
  { href: ROUTES.dashboard.ventas,             label: 'Ventas'      },
  { href: ROUTES.dashboard.ventasNueva,        label: 'Nueva venta' },
  { href: ROUTES.dashboard.clientes,           label: 'Clientes'    },
  { href: ROUTES.dashboard.reportes,           label: 'Reportes'    },
];

export const EMPLEADO_INVENTARIO_NAV: NavItem[] = [
  { href: ROUTES.dashboard.inventario,             label: 'Inicio'      },
  { href: ROUTES.dashboard.productos,              label: 'Productos'   },
  { href: ROUTES.dashboard.proveedores,            label: 'Proveedores' },
  { href: ROUTES.dashboard.inventarioRecepciones,  label: 'Recepciones' },
  { href: ROUTES.dashboard.inventarioStock,        label: 'Stock'       },
  { href: ROUTES.dashboard.reportes,               label: 'Reportes'    },
];

export const CLIENTE_NAV: NavItem[] = [
  { href: ROUTES.cliente.tienda,      label: 'Tienda'      },
  { href: ROUTES.cliente.misOrdenes,  label: 'Mis órdenes' },
  { href: ROUTES.cliente.perfil,      label: 'Perfil'      },
];

export const PROVEEDOR_NAV: NavItem[] = [
  { href: ROUTES.proveedor.portal,    label: 'Inicio'        },
  { href: ROUTES.proveedor.productos, label: 'Mis productos' },
  { href: ROUTES.proveedor.entregas,  label: 'Entregas'      },
  { href: ROUTES.proveedor.perfil,    label: 'Perfil'        },
];

// Backward-compat alias
export const DASHBOARD_NAV = ADMIN_NAV;

export function getNavItemsForRole(rol: string): NavItem[] {
  switch (rol) {
    case ROLES.ADMIN:               return ADMIN_NAV;
    case ROLES.EMPLEADO_VENTAS:     return EMPLEADO_VENTAS_NAV;
    case ROLES.EMPLEADO_INVENTARIO: return EMPLEADO_INVENTARIO_NAV;
    case ROLES.CLIENTE:             return CLIENTE_NAV;
    case ROLES.PROVEEDOR:           return PROVEEDOR_NAV;
    default:                        return [];
  }
}

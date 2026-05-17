import { ROUTES } from './routes';

export interface NavItem {
  href: string;
  label: string;
}

export const DASHBOARD_NAV: NavItem[] = [
  { href: ROUTES.dashboard.root,        label: 'Inicio' },
  { href: ROUTES.dashboard.productos,   label: 'Productos' },
  { href: ROUTES.dashboard.ventas,      label: 'Ventas' },
  { href: ROUTES.dashboard.proveedores, label: 'Proveedores' },
  { href: ROUTES.dashboard.reportes,    label: 'Reportes' },
];

export const CLIENTE_NAV: NavItem[] = [
  { href: ROUTES.cliente.tienda,     label: 'Tienda' },
  { href: ROUTES.cliente.carrito,    label: 'Carrito' },
  { href: ROUTES.cliente.misOrdenes, label: 'Mis Órdenes' },
  { href: ROUTES.cliente.perfil,     label: 'Mi Perfil' },
];

export const PROVEEDOR_NAV: NavItem[] = [
  { href: ROUTES.proveedor.portal, label: 'Portal' },
];

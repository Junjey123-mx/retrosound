import type { Role } from './roles';
import { ROLES } from './roles';
import { ROUTES } from '../constants/routes';

export function getDefaultRedirect(rol: Role | string): string {
  switch (rol) {
    case ROLES.ADMIN:
      return ROUTES.dashboard.root;
    case ROLES.EMPLEADO_VENTAS:
      return ROUTES.dashboard.ventas;
    case ROLES.EMPLEADO_INVENTARIO:
      return ROUTES.dashboard.inventario;
    case ROLES.CLIENTE:
      return ROUTES.cliente.tienda;
    case ROLES.PROVEEDOR:
      return ROUTES.proveedor.portal;
    default:
      return ROUTES.public.login;
  }
}

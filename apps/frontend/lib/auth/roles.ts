export const ROLES = {
  ADMIN:                'admin',
  EMPLEADO_VENTAS:      'empleado_ventas',
  EMPLEADO_INVENTARIO:  'empleado_inventario',
  CLIENTE:              'cliente',
  PROVEEDOR:            'proveedor',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export function isStaff(rol: string): boolean {
  return (
    rol === ROLES.ADMIN ||
    rol === ROLES.EMPLEADO_VENTAS ||
    rol === ROLES.EMPLEADO_INVENTARIO
  );
}

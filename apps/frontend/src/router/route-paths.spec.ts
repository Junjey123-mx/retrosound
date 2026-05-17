import { describe, expect, it } from 'vitest';

import { ROUTE_PATHS } from './route-paths';

describe('ROUTE_PATHS', () => {
  it('centraliza las rutas base de React Router', () => {
    expect(ROUTE_PATHS.PUBLIC.HOME).toBe('/');
    expect(ROUTE_PATHS.PUBLIC.LOGIN).toBe('/login');
    expect(ROUTE_PATHS.CLIENTE.STORE).toBe('/tienda');
    expect(ROUTE_PATHS.CLIENTE.PRODUCT_DETAIL).toBe('/tienda/:id');
    expect(ROUTE_PATHS.DASHBOARD.SALES).toBe('/dashboard/ventas');
    expect(ROUTE_PATHS.PROVEEDOR.HOME).toBe('/proveedor');
  });
});

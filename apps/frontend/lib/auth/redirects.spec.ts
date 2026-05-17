import { describe, it, expect } from 'vitest';
import { getDefaultRedirect } from './redirects';

describe('getDefaultRedirect', () => {
  it('returns /dashboard for admin', () => {
    expect(getDefaultRedirect('admin')).toBe('/dashboard');
  });

  it('returns /dashboard for empleado_ventas', () => {
    expect(getDefaultRedirect('empleado_ventas')).toBe('/dashboard');
  });

  it('returns /dashboard for empleado_inventario', () => {
    expect(getDefaultRedirect('empleado_inventario')).toBe('/dashboard');
  });

  it('returns /tienda for cliente', () => {
    expect(getDefaultRedirect('cliente')).toBe('/tienda');
  });

  it('returns /proveedor for proveedor', () => {
    expect(getDefaultRedirect('proveedor')).toBe('/proveedor');
  });

  it('returns /login for an unknown role', () => {
    expect(getDefaultRedirect('unknown_role')).toBe('/login');
  });
});

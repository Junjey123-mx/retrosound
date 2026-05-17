import { describe, it, expect } from 'vitest';
import { ROLES, isStaff } from './roles';

describe('ROLES', () => {
  it('defines exactly 5 roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(5);
  });

  it('does not contain the legacy "empleado" role', () => {
    expect(Object.values(ROLES)).not.toContain('empleado');
  });

  it('has admin role equal to "admin"', () => {
    expect(ROLES.ADMIN).toBe('admin');
  });

  it('has cliente role equal to "cliente"', () => {
    expect(ROLES.CLIENTE).toBe('cliente');
  });

  it('has proveedor role equal to "proveedor"', () => {
    expect(ROLES.PROVEEDOR).toBe('proveedor');
  });
});

describe('isStaff', () => {
  it('returns true for admin', () => {
    expect(isStaff('admin')).toBe(true);
  });

  it('returns true for empleado_ventas', () => {
    expect(isStaff('empleado_ventas')).toBe(true);
  });

  it('returns true for empleado_inventario', () => {
    expect(isStaff('empleado_inventario')).toBe(true);
  });

  it('returns false for cliente', () => {
    expect(isStaff('cliente')).toBe(false);
  });

  it('returns false for proveedor', () => {
    expect(isStaff('proveedor')).toBe(false);
  });
});

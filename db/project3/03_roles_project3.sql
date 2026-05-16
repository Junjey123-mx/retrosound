-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 03_roles_project3.sql
-- Purpose: DBMS role creation for Proyecto 3 security layer
-- Run after: 01_schema_project3.sql, 02_seed_project3.sql
-- ============================================================

-- Group roles have no LOGIN; permissions are assigned in 07_permissions_project3.sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_admin') THEN
        CREATE ROLE rs_admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_empleado_ventas') THEN
        CREATE ROLE rs_empleado_ventas;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_empleado_inventario') THEN
        CREATE ROLE rs_empleado_inventario;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_cliente') THEN
        CREATE ROLE rs_cliente;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_proveedor') THEN
        CREATE ROLE rs_proveedor;
    END IF;
    -- proy3: ORM connection user; docker-compose still uses proy2 (must be updated separately)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'proy3') THEN
        CREATE ROLE proy3 WITH LOGIN PASSWORD 'secret';
    END IF;
END $$;

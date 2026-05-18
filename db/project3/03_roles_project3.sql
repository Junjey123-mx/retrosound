-- ============================================================
-- RetroSound Store - Proyecto 2 Web / Proyecto 3 DB
-- File: 03_roles_project3.sql
-- Purpose: DBMS role creation for security layer
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
    -- proy2: ORM connection user for Proyecto 2 Web evaluation (LOGIN required).
    -- Note: proy3 was used in an earlier iteration and is now legacy / not needed.
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'proy2') THEN
        CREATE ROLE proy2 WITH LOGIN PASSWORD 'secret';
    END IF;
END $$;

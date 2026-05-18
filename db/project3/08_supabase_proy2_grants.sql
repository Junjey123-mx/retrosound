-- ============================================================
-- RetroSound Store — Supabase / Producción
-- File: 08_supabase_proy2_grants.sql
-- Purpose: Ensure proy2 exists and has all required grants
--          in Supabase-hosted or any managed PostgreSQL instance.
--
-- Run ONCE after all other project3 scripts:
--   psql $DATABASE_URL -f db/project3/08_supabase_proy2_grants.sql
--
-- NOTE: In Supabase the superuser is "postgres"; run this script
--       as postgres or a role with CREATEROLE privilege.
-- ============================================================

-- ── 1. Create proy2 if it does not yet exist ─────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'proy2') THEN
        CREATE ROLE proy2 WITH LOGIN PASSWORD 'secret';
    END IF;
END $$;

-- ── 2. Database-level access ──────────────────────────────────
-- Replace <db_name> with the actual database name if needed
-- (in Supabase the default database is "postgres").
GRANT CONNECT ON DATABASE retrosound TO proy2;

-- ── 3. Schema-level access ────────────────────────────────────
GRANT USAGE ON SCHEMA public TO proy2;

-- ── 4. Grant functional roles to proy2 ───────────────────────
-- Functional roles must already exist (created by 03_roles_project3.sql).
GRANT rs_admin                 TO proy2;
GRANT rs_empleado_ventas       TO proy2;
GRANT rs_empleado_inventario   TO proy2;
GRANT rs_cliente               TO proy2;
GRANT rs_proveedor             TO proy2;

-- ── 5. Table and sequence access (mirrors 07_permissions) ─────
-- Allows proy2 to act under any functional role via SET ROLE.
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO proy2;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO proy2;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO proy2;

-- Ensure future tables/sequences are also covered:
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO proy2;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO proy2;

-- ── Verification queries (run manually to confirm) ────────────
-- SELECT rolname, rolcanlogin FROM pg_roles
--   WHERE rolname IN ('proy2','rs_admin','rs_empleado_ventas',
--                     'rs_empleado_inventario','rs_cliente','rs_proveedor')
--   ORDER BY rolname;
--
-- SELECT grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE grantee = 'proy2'
--   LIMIT 10;

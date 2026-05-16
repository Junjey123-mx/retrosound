-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 07_permissions_project3.sql
-- Purpose: GRANT/REVOKE for the 5 DBMS roles
-- Run after: 01_schema_project3.sql, 03_roles_project3.sql, 05_views_project3.sql
-- ============================================================

-- ── Security baseline ────────────────────────────────────────
REVOKE ALL ON SCHEMA public                    FROM PUBLIC;
REVOKE ALL ON ALL TABLES    IN SCHEMA public   FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public   FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public   FROM PUBLIC;

-- schema access for all roles and the ORM connection user
GRANT USAGE ON SCHEMA public TO
    rs_admin, rs_empleado_ventas, rs_empleado_inventario,
    rs_cliente, rs_proveedor, proy3;

-- ── rs_admin ─────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES    IN SCHEMA public TO rs_admin;
GRANT USAGE, SELECT, UPDATE
    ON ALL SEQUENCES IN SCHEMA public TO rs_admin;

-- ── rs_empleado_ventas ────────────────────────────────────────
GRANT SELECT
    ON producto, categoria, formato, genero_musical, artista,
       producto_artista, producto_genero
    TO rs_empleado_ventas;

GRANT SELECT, INSERT, UPDATE ON cliente       TO rs_empleado_ventas;
GRANT SELECT, INSERT, UPDATE ON venta         TO rs_empleado_ventas;
GRANT SELECT, INSERT         ON detalle_venta TO rs_empleado_ventas;
GRANT SELECT                 ON carrito, carrito_item TO rs_empleado_ventas;

GRANT USAGE, SELECT, UPDATE
    ON cliente_id_cliente_seq,
       venta_id_venta_seq,
       detalle_venta_id_detalle_venta_seq
    TO rs_empleado_ventas;

-- ── rs_empleado_inventario ────────────────────────────────────
GRANT SELECT, INSERT, UPDATE
    ON producto, proveedor, producto_proveedor,
       compra_proveedor, detalle_compra_proveedor
    TO rs_empleado_inventario;

GRANT SELECT
    ON categoria, formato, genero_musical, artista,
       producto_artista, producto_genero
    TO rs_empleado_inventario;

GRANT SELECT ON vista_recepciones_pendientes TO rs_empleado_inventario;
GRANT SELECT ON vista_stock_critico          TO rs_empleado_inventario;

GRANT USAGE, SELECT, UPDATE
    ON producto_id_producto_seq,
       proveedor_id_proveedor_seq,
       compra_proveedor_id_compra_proveedor_seq,
       detalle_compra_proveedor_id_detalle_compra_proveedor_seq
    TO rs_empleado_inventario;

-- ── rs_cliente ────────────────────────────────────────────────
GRANT SELECT
    ON producto, categoria, formato, genero_musical, artista,
       producto_artista, producto_genero
    TO rs_cliente;

-- backend must filter by id_cliente; no RLS enforced at DB level yet
GRANT SELECT ON venta, detalle_venta TO rs_cliente;

GRANT SELECT, UPDATE             ON cliente              TO rs_cliente;
GRANT SELECT, INSERT, UPDATE, DELETE ON carrito, carrito_item TO rs_cliente;

GRANT USAGE, SELECT, UPDATE
    ON carrito_id_carrito_seq,
       carrito_item_id_carrito_item_seq
    TO rs_cliente;

-- ── rs_proveedor ──────────────────────────────────────────────
GRANT SELECT                 ON producto, producto_proveedor TO rs_proveedor;
GRANT SELECT, UPDATE         ON proveedor                    TO rs_proveedor;
-- backend must filter by id_proveedor for compra rows
GRANT SELECT, INSERT         ON compra_proveedor             TO rs_proveedor;
GRANT SELECT, INSERT         ON detalle_compra_proveedor     TO rs_proveedor;
GRANT SELECT                 ON vista_productos_proveedor    TO rs_proveedor;

-- column-level UPDATE: provider may only edit description and image; not price/stock/sku/estado
GRANT UPDATE (descripcion_producto, imagen_url, imagen_public_id)
    ON producto TO rs_proveedor;

GRANT USAGE, SELECT, UPDATE
    ON compra_proveedor_id_compra_proveedor_seq,
       detalle_compra_proveedor_id_detalle_compra_proveedor_seq
    TO rs_proveedor;

-- ── proy3 (ORM connection user) ───────────────────────────────
-- backend calls SET ROLE to switch to the appropriate functional role per request
GRANT rs_admin                 TO proy3;
GRANT rs_empleado_ventas       TO proy3;
GRANT rs_empleado_inventario   TO proy3;
GRANT rs_cliente               TO proy3;
GRANT rs_proveedor             TO proy3;

-- sales summary view defined in retrosound_ddl.sql
GRANT SELECT ON vista_resumen_ventas TO rs_empleado_ventas, rs_admin;

-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 06_indexes_project3.sql
-- Todos los índices usan CREATE INDEX IF NOT EXISTS para
-- ser re-ejecutables sin error.
--
-- Índices base (DDL original) ya existentes — NO se duplican:
--   idx_producto_titulo, idx_venta_fecha, idx_cliente_correo,
--   idx_carrito_cliente_estado, uq_carrito_activo_por_cliente
--
-- Índices implícitos por UNIQUE/PK — NO se duplican:
--   producto.codigo_sku, usuario.correo_usuario,
--   detalle_venta(id_venta, id_producto) [cubre id_venta],
--   detalle_compra_proveedor(id_compra_proveedor, id_producto) [cubre id_compra_proveedor],
--   carrito_item(id_carrito, id_producto) [cubre id_carrito],
--   producto_proveedor PK(id_producto, id_proveedor) [cubre id_producto]
-- ============================================================

BEGIN;

-- ── producto_proveedor ───────────────────────────────────────
-- PK es (id_producto, id_proveedor); id_proveedor solo no está cubierto.
-- Permite listar todos los productos de un proveedor (portal proveedor).
CREATE INDEX IF NOT EXISTS idx_producto_proveedor_id_proveedor
    ON producto_proveedor(id_proveedor);

-- ── compra_proveedor ─────────────────────────────────────────
-- Compuesto cubre: id_proveedor solo (leftmost) + (id_proveedor, estado_compra).
CREATE INDEX IF NOT EXISTS idx_compra_proveedor_proveedor_estado
    ON compra_proveedor(id_proveedor, estado_compra);

-- estado_compra solo, para vista_recepciones_pendientes y filtros globales
-- que no especifican proveedor.
CREATE INDEX IF NOT EXISTS idx_compra_proveedor_estado
    ON compra_proveedor(estado_compra);

-- ── detalle_compra_proveedor ─────────────────────────────────
-- UNIQUE(id_compra_proveedor, id_producto) cubre id_compra_proveedor.
-- id_producto solo necesita índice propio para rastrear compras por producto.
CREATE INDEX IF NOT EXISTS idx_detalle_compra_proveedor_producto
    ON detalle_compra_proveedor(id_producto);

-- ── producto ─────────────────────────────────────────────────
-- Soporta vista_stock_critico: WHERE stock_actual <= stock_minimo.
CREATE INDEX IF NOT EXISTS idx_producto_stock_actual_minimo
    ON producto(stock_actual, stock_minimo);

-- Búsqueda/borrado de assets en Cloudinary por public_id
-- (sp_actualizar_imagen_producto, columna agregada en 01_schema_project3.sql).
CREATE INDEX IF NOT EXISTS idx_producto_imagen_public_id
    ON producto(imagen_public_id);

-- ── usuario ──────────────────────────────────────────────────
-- correo_usuario ya tiene UNIQUE (índice implícito).
-- Filtros por rol + estado: empleados activos, proveedores activos, etc.
CREATE INDEX IF NOT EXISTS idx_usuario_rol_estado
    ON usuario(rol_usuario, estado_usuario);

-- ── venta ────────────────────────────────────────────────────
-- idx_venta_fecha ya existe en el DDL base.
-- Historial de compras por cliente con orden cronológico.
CREATE INDEX IF NOT EXISTS idx_venta_cliente_fecha
    ON venta(id_cliente, fecha_venta);

-- Filtrado por estado (pendiente, completada, cancelada).
CREATE INDEX IF NOT EXISTS idx_venta_estado
    ON venta(estado_venta);

-- ── detalle_venta ────────────────────────────────────────────
-- UNIQUE(id_venta, id_producto) cubre id_venta.
-- id_producto solo: analítica de ventas por producto.
CREATE INDEX IF NOT EXISTS idx_detalle_venta_producto
    ON detalle_venta(id_producto);

-- ── carrito_item ─────────────────────────────────────────────
-- UNIQUE(id_carrito, id_producto) cubre id_carrito.
-- id_producto solo: verificar en qué carritos está un producto.
CREATE INDEX IF NOT EXISTS idx_carrito_item_producto
    ON carrito_item(id_producto);

COMMIT;

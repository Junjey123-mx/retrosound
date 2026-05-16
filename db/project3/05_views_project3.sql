-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 05_views_project3.sql
-- ============================================================

BEGIN;

-- pending supplier deliveries; used by rs_empleado_inventario
CREATE OR REPLACE VIEW vista_recepciones_pendientes AS
SELECT
    cp.id_compra_proveedor,
    cp.fecha_compra_proveedor,
    cp.estado_compra,
    cp.id_proveedor,
    prov.nombre_proveedor,
    dcp.id_producto,
    prod.titulo_producto,
    prod.codigo_sku,
    prod.stock_actual,
    dcp.id_detalle_compra_proveedor,
    dcp.cantidad_comprada,
    dcp.cantidad_recibida,
    dcp.costo_unitario_compra
FROM  compra_proveedor cp
JOIN  proveedor                  prov ON prov.id_proveedor        = cp.id_proveedor
JOIN  detalle_compra_proveedor   dcp  ON dcp.id_compra_proveedor  = cp.id_compra_proveedor
JOIN  producto                   prod ON prod.id_producto         = dcp.id_producto
WHERE cp.estado_compra = 'pendiente';

-- product-supplier associations from producto_proveedor (created in 01_schema_project3.sql)
CREATE OR REPLACE VIEW vista_productos_proveedor AS
SELECT
    pp.id_proveedor,
    prov.nombre_proveedor,
    pp.id_producto,
    prod.titulo_producto,
    prod.codigo_sku,
    prod.descripcion_producto,
    prod.precio_venta,
    prod.stock_actual,
    prod.stock_minimo,
    prod.estado_producto,
    prod.imagen_url,
    prod.imagen_public_id,
    cat.nombre_categoria,
    f.nombre_formato
FROM  producto_proveedor pp
JOIN  proveedor  prov ON prov.id_proveedor = pp.id_proveedor
JOIN  producto   prod ON prod.id_producto  = pp.id_producto
JOIN  categoria  cat  ON cat.id_categoria  = prod.id_categoria
JOIN  formato    f    ON f.id_formato      = prod.id_formato;

CREATE OR REPLACE VIEW vista_stock_critico AS
SELECT
    id_producto,
    titulo_producto,
    codigo_sku,
    stock_actual,
    stock_minimo,
    estado_producto
FROM  producto
WHERE stock_actual <= stock_minimo;

COMMIT;

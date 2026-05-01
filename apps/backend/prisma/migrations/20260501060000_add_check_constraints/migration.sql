-- Restricciones de negocio sobre valores numéricos
-- Estas garantizan integridad de datos más allá de NOT NULL

-- producto: precios y stock no pueden ser negativos
ALTER TABLE "producto"
  ADD CONSTRAINT "chk_producto_precio_positivo"    CHECK ("precio_venta"  >= 0),
  ADD CONSTRAINT "chk_producto_stock_actual"        CHECK ("stock_actual"  >= 0),
  ADD CONSTRAINT "chk_producto_stock_minimo"        CHECK ("stock_minimo"  >= 0);

-- venta: descuento no puede ser negativo
ALTER TABLE "venta"
  ADD CONSTRAINT "chk_venta_descuento"             CHECK ("descuento_venta" >= 0);

-- detalle_venta: cantidad vendida debe ser positiva; precios y descuentos >= 0
ALTER TABLE "detalle_venta"
  ADD CONSTRAINT "chk_detalle_venta_cantidad"      CHECK ("cantidad_vendida"      > 0),
  ADD CONSTRAINT "chk_detalle_venta_precio"        CHECK ("precio_unitario_venta" >= 0),
  ADD CONSTRAINT "chk_detalle_venta_descuento"     CHECK ("descuento_detalle"     >= 0);

-- detalle_compra_proveedor: cantidad comprada debe ser positiva; costo >= 0
ALTER TABLE "detalle_compra_proveedor"
  ADD CONSTRAINT "chk_compra_cantidad"             CHECK ("cantidad_comprada"      > 0),
  ADD CONSTRAINT "chk_compra_costo"                CHECK ("costo_unitario_compra"  >= 0);

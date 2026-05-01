-- Actualización de VIEW: vista_resumen_ventas
-- Agrega columnas iva_12 (12% sobre total_neto) y total (total_neto + iva)
-- Criterio rúbrica: "Al menos 1 VIEW utilizado por el backend para alimentar la UI"

CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT
  v.id_venta,
  v.fecha_venta,
  v.metodo_pago,
  v.estado_venta,
  v.descuento_venta,
  (c.nombre_cliente || ' ' || c.apellido_cliente)             AS cliente,
  c.correo_cliente,
  (e.nombre_empleado || ' ' || e.apellido_empleado)           AS empleado,
  COUNT(dv.id_detalle_venta)::INT                             AS total_items,
  COALESCE(SUM(
    dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
  ), 0)                                                       AS total_bruto,
  ROUND(
    COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta,
    2
  )                                                           AS total_neto,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 0.12,
    2
  )                                                           AS iva_12,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 1.12,
    2
  )                                                           AS total
FROM venta v
JOIN cliente  c ON c.id_cliente  = v.id_cliente
JOIN empleado e ON e.id_empleado = v.id_empleado
LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
GROUP BY
  v.id_venta, v.fecha_venta, v.metodo_pago, v.estado_venta, v.descuento_venta,
  c.nombre_cliente, c.apellido_cliente, c.correo_cliente,
  e.nombre_empleado, e.apellido_empleado;

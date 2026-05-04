-- AlterTable: hacer id_empleado nullable en venta
-- Motivo: las ventas creadas desde checkout web no tienen empleado asignado.
-- Las ventas administrativas (POST /ventas) siguen usando id_empleado obligatorio
-- a nivel de aplicación (el DTO sigue exigiendo idEmpleado).
-- id_empleado = NULL indica "venta online sin empleado atendiendo".
ALTER TABLE "venta"
  ALTER COLUMN "id_empleado" DROP NOT NULL;

-- UpdateView: actualizar vista_resumen_ventas para incluir ventas online
-- Cambia INNER JOIN a LEFT JOIN en empleado para que las ventas con
-- id_empleado = NULL (checkout online) aparezcan en los reportes.
-- Usa COALESCE para mostrar 'Venta Online' cuando no hay empleado.
CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT
  v.id_venta,
  v.fecha_venta,
  v.metodo_pago,
  v.estado_venta,
  v.descuento_venta,
  (c.nombre_cliente || ' ' || c.apellido_cliente)                        AS cliente,
  c.correo_cliente,
  COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Venta Online') AS empleado,
  COUNT(dv.id_detalle_venta)::INT                                        AS total_items,
  COALESCE(SUM(
    dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
  ), 0)                                                                  AS total_bruto,
  ROUND(
    COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta,
    2
  )                                                                      AS total_neto,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 0.12,
    2
  )                                                                      AS iva_12,
  ROUND(
    (COALESCE(SUM(
      dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) - v.descuento_venta) * 1.12,
    2
  )                                                                      AS total
FROM venta v
JOIN     cliente  c ON c.id_cliente  = v.id_cliente
LEFT JOIN empleado e ON e.id_empleado = v.id_empleado   -- LEFT JOIN: incluye ventas online
LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
GROUP BY
  v.id_venta, v.fecha_venta, v.metodo_pago, v.estado_venta, v.descuento_venta,
  c.nombre_cliente, c.apellido_cliente, c.correo_cliente,
  e.nombre_empleado, e.apellido_empleado;

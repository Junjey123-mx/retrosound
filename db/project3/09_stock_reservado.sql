-- Reserva de stock: columna para rastrear unidades bloqueadas por carritos activos
ALTER TABLE producto
  ADD COLUMN IF NOT EXISTS stock_reservado INTEGER NOT NULL DEFAULT 0
    CHECK (stock_reservado >= 0);

-- sp_checkout_carrito: convierte el carrito activo del cliente en una venta.
-- Usa COMMIT/ROLLBACK explícitos (requiere llamarse fuera de un bloque de transacción).
CREATE OR REPLACE PROCEDURE sp_checkout_carrito(
    IN  p_id_cliente        INTEGER,
    IN  p_metodo_pago       VARCHAR,
    OUT p_id_venta_generada INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_carrito INTEGER;
    v_item       RECORD;
    v_stock      INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente) THEN
        ROLLBACK;
        RAISE EXCEPTION 'client % does not exist', p_id_cliente;
    END IF;

    SELECT id_carrito INTO v_id_carrito
    FROM   carrito
    WHERE  id_cliente = p_id_cliente AND estado_carrito = 'activo'
    FOR UPDATE;

    IF NOT FOUND THEN
        ROLLBACK;
        RAISE EXCEPTION 'no active cart for client %', p_id_cliente;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM carrito_item WHERE id_carrito = v_id_carrito) THEN
        ROLLBACK;
        RAISE EXCEPTION 'cart % is empty', v_id_carrito;
    END IF;

    INSERT INTO venta (
        fecha_venta, descuento_venta, metodo_pago, estado_venta,
        id_cliente, id_empleado
    ) VALUES (
        CURRENT_DATE, 0, p_metodo_pago, 'completada', p_id_cliente, NULL
    )
    RETURNING id_venta INTO p_id_venta_generada;

    -- order by id_producto for consistent lock acquisition (deadlock prevention)
    FOR v_item IN
        SELECT ci.id_producto, ci.cantidad, ci.precio_unitario_snapshot
        FROM   carrito_item ci
        WHERE  ci.id_carrito = v_id_carrito
        ORDER BY ci.id_producto
    LOOP
        SELECT stock_actual INTO v_stock
        FROM   producto
        WHERE  id_producto = v_item.id_producto
        FOR UPDATE;

        IF NOT FOUND THEN
            ROLLBACK;
            RAISE EXCEPTION 'product % does not exist', v_item.id_producto;
        END IF;

        IF v_stock < v_item.cantidad THEN
            ROLLBACK;
            RAISE EXCEPTION 'insufficient stock for product %: have %, need %',
                v_item.id_producto, v_stock, v_item.cantidad;
        END IF;

        INSERT INTO detalle_venta (
            id_venta, id_producto, cantidad_vendida,
            precio_unitario_venta, descuento_detalle
        ) VALUES (
            p_id_venta_generada, v_item.id_producto, v_item.cantidad,
            v_item.precio_unitario_snapshot, 0
        );

        UPDATE producto
        SET    stock_actual    = stock_actual - v_item.cantidad,
               stock_reservado = GREATEST(0, stock_reservado - v_item.cantidad),
               estado_producto = CASE
                   WHEN stock_actual - v_item.cantidad = 0 THEN 'agotado'
                   ELSE estado_producto
               END
        WHERE  id_producto = v_item.id_producto;
    END LOOP;

    UPDATE carrito
    SET    estado_carrito = 'convertido'
    WHERE  id_carrito = v_id_carrito;

    COMMIT;
END;
$$;

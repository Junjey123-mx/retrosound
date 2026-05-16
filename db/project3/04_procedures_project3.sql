-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 04_procedures_project3.sql
-- ============================================================

-- ── sp_registrar_entrega_proveedor ───────────────────────────
-- Creates a pending purchase order for a provider-initiated delivery.
-- id_empleado is NULL until inventory confirms receipt.
CREATE OR REPLACE PROCEDURE sp_registrar_entrega_proveedor(
    IN  p_id_proveedor       INTEGER,
    IN  p_id_producto        INTEGER,
    IN  p_cantidad_reportada INTEGER,
    IN  p_costo_unitario     NUMERIC,
    OUT p_id_compra_generada INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_cantidad_reportada <= 0 THEN
        RAISE EXCEPTION 'cantidad_reportada must be > 0, got %', p_cantidad_reportada;
    END IF;

    IF p_costo_unitario < 0 THEN
        RAISE EXCEPTION 'costo_unitario must be >= 0, got %', p_costo_unitario;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM producto_proveedor
        WHERE id_producto = p_id_producto AND id_proveedor = p_id_proveedor
    ) THEN
        RAISE EXCEPTION 'product % is not associated with supplier %',
            p_id_producto, p_id_proveedor;
    END IF;

    INSERT INTO compra_proveedor (
        fecha_compra_proveedor, estado_compra, id_proveedor, id_empleado
    ) VALUES (
        CURRENT_DATE, 'pendiente', p_id_proveedor, NULL
    )
    RETURNING id_compra_proveedor INTO p_id_compra_generada;

    INSERT INTO detalle_compra_proveedor (
        id_compra_proveedor, id_producto,
        cantidad_comprada, costo_unitario_compra, cantidad_recibida
    ) VALUES (
        p_id_compra_generada, p_id_producto,
        p_cantidad_reportada, p_costo_unitario, NULL
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE; -- propagates to caller; any enclosing transaction is rolled back
END;
$$;

-- ── sp_confirmar_recepcion_stock ─────────────────────────────
-- Confirms physical receipt of goods: updates received qty, increments stock,
-- and sets order status to 'recibida' or 'parcial'.
-- Uses FOR UPDATE to serialize concurrent confirmations on the same rows.
CREATE OR REPLACE PROCEDURE sp_confirmar_recepcion_stock(
    IN  p_id_detalle_compra INTEGER,
    IN  p_cantidad_recibida INTEGER,
    IN  p_id_empleado       INTEGER,
    OUT p_nuevo_stock       INTEGER,
    OUT p_estado_compra     VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_compra              INTEGER;
    v_id_producto            INTEGER;
    v_cant_comprada          INTEGER;
    v_cantidad_ya_recibida   INTEGER;
    v_estado_actual          VARCHAR(20);
BEGIN
    IF p_cantidad_recibida <= 0 THEN
        RAISE EXCEPTION 'cantidad_recibida must be > 0, got %', p_cantidad_recibida;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM empleado WHERE id_empleado = p_id_empleado) THEN
        RAISE EXCEPTION 'employee % does not exist', p_id_empleado;
    END IF;

    -- lock detail row to prevent concurrent stock updates on the same delivery
    SELECT id_compra_proveedor, id_producto, cantidad_comprada, cantidad_recibida
    INTO   v_id_compra, v_id_producto, v_cant_comprada, v_cantidad_ya_recibida
    FROM   detalle_compra_proveedor
    WHERE  id_detalle_compra_proveedor = p_id_detalle_compra
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'detalle_compra % does not exist', p_id_detalle_compra;
    END IF;

    IF v_cantidad_ya_recibida IS NOT NULL THEN
        RAISE EXCEPTION 'receipt already confirmed for detalle_compra %', p_id_detalle_compra;
    END IF;

    -- lock parent order row
    SELECT estado_compra
    INTO   v_estado_actual
    FROM   compra_proveedor
    WHERE  id_compra_proveedor = v_id_compra
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'compra_proveedor % does not exist', v_id_compra;
    END IF;

    IF v_estado_actual = 'cancelada' THEN
        RAISE EXCEPTION 'compra % is cancelled; cannot confirm receipt', v_id_compra;
    END IF;

    IF p_cantidad_recibida > v_cant_comprada THEN
        RAISE EXCEPTION 'cantidad_recibida (%) exceeds cantidad_comprada (%)',
            p_cantidad_recibida, v_cant_comprada;
    END IF;

    UPDATE detalle_compra_proveedor
    SET    cantidad_recibida = p_cantidad_recibida
    WHERE  id_detalle_compra_proveedor = p_id_detalle_compra;

    -- critical stock update; exception here rolls back all changes above
    UPDATE producto
    SET    stock_actual = stock_actual + p_cantidad_recibida
    WHERE  id_producto  = v_id_producto
    RETURNING stock_actual INTO p_nuevo_stock;

    p_estado_compra := CASE
        WHEN p_cantidad_recibida = v_cant_comprada THEN 'recibida'
        ELSE 'parcial'
    END;

    UPDATE compra_proveedor
    SET    estado_compra = p_estado_compra,
           id_empleado   = p_id_empleado
    WHERE  id_compra_proveedor = v_id_compra;

EXCEPTION
    WHEN OTHERS THEN
        RAISE; -- re-raise so stock increment and status change are rolled back
END;
$$;

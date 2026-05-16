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

-- ── sp_crear_venta ────────────────────────────────────────────
-- Registers a new sale; validates and decrements stock per item.
-- Items JSONB: [{"idProducto": N, "cantidad": N, "descuento": N}, ...]
-- Products locked in id_producto order to prevent deadlocks.
CREATE OR REPLACE PROCEDURE sp_crear_venta(
    IN  p_id_cliente        INTEGER,
    IN  p_id_empleado       INTEGER,
    IN  p_metodo_pago       VARCHAR,
    IN  p_descuento_venta   NUMERIC,
    IN  p_items             JSONB,
    OUT p_id_venta_generada INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item        JSONB;
    v_id_producto INTEGER;
    v_cantidad    INTEGER;
    v_descuento   NUMERIC;
    v_precio      NUMERIC;
    v_stock       INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente) THEN
        RAISE EXCEPTION 'client % does not exist', p_id_cliente;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM empleado WHERE id_empleado = p_id_empleado) THEN
        RAISE EXCEPTION 'employee % does not exist', p_id_empleado;
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'items cannot be empty';
    END IF;

    INSERT INTO venta (
        fecha_venta, descuento_venta, metodo_pago, estado_venta,
        id_cliente, id_empleado
    ) VALUES (
        CURRENT_DATE, COALESCE(p_descuento_venta, 0),
        p_metodo_pago, 'completada',
        p_id_cliente, p_id_empleado
    )
    RETURNING id_venta INTO p_id_venta_generada;

    FOR v_item IN
        SELECT elem FROM jsonb_array_elements(p_items) AS elem
        ORDER BY (elem->>'idProducto')::INTEGER
    LOOP
        v_id_producto := (v_item->>'idProducto')::INTEGER;
        v_cantidad    := (v_item->>'cantidad')::INTEGER;
        v_descuento   := COALESCE((v_item->>'descuento')::NUMERIC, 0);

        IF v_cantidad <= 0 THEN
            RAISE EXCEPTION 'cantidad must be > 0 for product %', v_id_producto;
        END IF;

        SELECT precio_venta, stock_actual
        INTO   v_precio, v_stock
        FROM   producto
        WHERE  id_producto = v_id_producto
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'product % does not exist', v_id_producto;
        END IF;

        IF v_stock < v_cantidad THEN
            RAISE EXCEPTION 'insufficient stock for product %: have %, need %',
                v_id_producto, v_stock, v_cantidad;
        END IF;

        INSERT INTO detalle_venta (
            id_venta, id_producto, cantidad_vendida,
            precio_unitario_venta, descuento_detalle
        ) VALUES (
            p_id_venta_generada, v_id_producto, v_cantidad,
            v_precio, v_descuento
        );

        -- 'agotado' is a valid estado_producto per DDL CHECK constraint
        UPDATE producto
        SET    stock_actual     = stock_actual - v_cantidad,
               estado_producto  = CASE
                   WHEN stock_actual - v_cantidad = 0 THEN 'agotado'
                   ELSE estado_producto
               END
        WHERE  id_producto = v_id_producto;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- ── sp_checkout_carrito ───────────────────────────────────────
-- Converts the client's active cart into a completed sale.
-- id_empleado is NULL for online sales (allowed by DDL).
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
        RAISE EXCEPTION 'client % does not exist', p_id_cliente;
    END IF;

    SELECT id_carrito INTO v_id_carrito
    FROM   carrito
    WHERE  id_cliente = p_id_cliente AND estado_carrito = 'activo'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'no active cart for client %', p_id_cliente;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM carrito_item WHERE id_carrito = v_id_carrito) THEN
        RAISE EXCEPTION 'cart % is empty', v_id_carrito;
    END IF;

    INSERT INTO venta (
        fecha_venta, descuento_venta, metodo_pago, estado_venta,
        id_cliente, id_empleado
    ) VALUES (
        CURRENT_DATE, 0, p_metodo_pago, 'completada', p_id_cliente, NULL
    )
    RETURNING id_venta INTO p_id_venta_generada;

    -- order by id_producto for consistent lock acquisition
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
            RAISE EXCEPTION 'product % does not exist', v_item.id_producto;
        END IF;

        IF v_stock < v_item.cantidad THEN
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
               estado_producto = CASE
                   WHEN stock_actual - v_item.cantidad = 0 THEN 'agotado'
                   ELSE estado_producto
               END
        WHERE  id_producto = v_item.id_producto;
    END LOOP;

    -- 'convertido' is a valid estado_carrito per DDL CHECK constraint
    UPDATE carrito
    SET    estado_carrito = 'convertido'
    WHERE  id_carrito = v_id_carrito;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

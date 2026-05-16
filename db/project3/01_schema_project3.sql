
BEGIN;
UPDATE usuario
    SET rol_usuario = 'empleado_ventas'
    WHERE rol_usuario = 'empleado';
ALTER TABLE usuario
    DROP CONSTRAINT IF EXISTS chk_usuario_rol;
    
ALTER TABLE usuario
    ADD CONSTRAINT chk_usuario_rol
        CHECK (rol_usuario IN (
            'admin',
            'empleado_ventas',
            'empleado_inventario',
            'cliente',
            'proveedor'
        ));

-- Cloudinary image reference: public URL + asset identifier for replace/delete
ALTER TABLE producto
    ADD COLUMN IF NOT EXISTS imagen_url       TEXT,
    ADD COLUMN IF NOT EXISTS imagen_public_id VARCHAR(255);

-- NULL while delivery is pending; set on receipt confirmation
ALTER TABLE detalle_compra_proveedor
    ADD COLUMN IF NOT EXISTS cantidad_recibida INTEGER;

ALTER TABLE detalle_compra_proveedor
    DROP CONSTRAINT IF EXISTS chk_cantidad_recibida_valida,
    DROP CONSTRAINT IF EXISTS chk_cantidad_recibida_no_supera_comprada;

ALTER TABLE detalle_compra_proveedor
    ADD CONSTRAINT chk_cantidad_recibida_valida
        CHECK (cantidad_recibida IS NULL OR cantidad_recibida >= 0),
    ADD CONSTRAINT chk_cantidad_recibida_no_supera_comprada
        CHECK (cantidad_recibida IS NULL OR cantidad_recibida <= cantidad_comprada);

-- 'parcial' covers receipts where cantidad_recibida < cantidad_comprada
ALTER TABLE compra_proveedor
    DROP CONSTRAINT IF EXISTS chk_compra_proveedor_estado;

ALTER TABLE compra_proveedor
    ADD CONSTRAINT chk_compra_proveedor_estado
        CHECK (estado_compra IN ('pendiente', 'recibida', 'parcial', 'cancelada'));

-- provider-initiated deliveries arrive before an employee confirms them
ALTER TABLE compra_proveedor
    ALTER COLUMN id_empleado DROP NOT NULL;

-- explicit product-supplier ownership; enables provider portal scoping and permission grants
CREATE TABLE IF NOT EXISTS producto_proveedor (
    id_producto          INTEGER NOT NULL,
    id_proveedor         INTEGER NOT NULL,
    es_proveedor_principal BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT producto_proveedor_pkey PRIMARY KEY (id_producto, id_proveedor),
    CONSTRAINT producto_proveedor_prod_fkey
        FOREIGN KEY (id_producto)  REFERENCES producto(id_producto)  ON DELETE CASCADE,
    CONSTRAINT producto_proveedor_prov_fkey
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor) ON DELETE CASCADE
);

-- seed from purchase history; existing rows are skipped on re-run
INSERT INTO producto_proveedor (id_producto, id_proveedor)
SELECT DISTINCT dcp.id_producto, cp.id_proveedor
FROM   detalle_compra_proveedor dcp
JOIN   compra_proveedor cp ON cp.id_compra_proveedor = dcp.id_compra_proveedor
ON CONFLICT DO NOTHING;

COMMIT;
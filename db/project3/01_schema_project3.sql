
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

COMMIT;
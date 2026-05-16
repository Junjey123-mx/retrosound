
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

COMMIT;
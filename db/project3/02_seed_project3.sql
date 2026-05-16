-- ============================================================
-- RetroSound Store - Proyecto 3
-- File: 02_seed_project3.sql
-- ============================================================

BEGIN;

-- employees 6-10 are reclassified as inventory staff;
-- no data clearly separates sales vs inventory employees in the base seed,
-- so the split is even (2-5 → ventas, 6-10 → inventario)
UPDATE usuario
    SET rol_usuario = 'empleado_inventario'
    WHERE id_empleado IN (6, 7, 8, 9, 10);

-- demo accounts for each application role
-- hash matches the base seed (bcrypt, same password for all demo users)
-- admin@retrosound.com already exists with rol='admin'; no insert needed
-- empleado ids 11-12 and cliente id 14 and proveedor id 3 have no user yet
INSERT INTO usuario (
    correo_usuario, contrasena_hash, rol_usuario,
    estado_usuario, fecha_inactivacion,
    id_cliente, id_empleado, id_proveedor
) VALUES
    ('ventas@retrosound.com',
     '$2b$10$AdrgkEp5vXJ/410Vbt1cwuFp/HqdFctL7FHPeB24TOz1j6qdXuZZO',
     'empleado_ventas',     'activo', NULL, NULL, 11, NULL),
    ('inventario@retrosound.com',
     '$2b$10$AdrgkEp5vXJ/410Vbt1cwuFp/HqdFctL7FHPeB24TOz1j6qdXuZZO',
     'empleado_inventario', 'activo', NULL, NULL, 12, NULL),
    ('cliente@retrosound.com',
     '$2b$10$AdrgkEp5vXJ/410Vbt1cwuFp/HqdFctL7FHPeB24TOz1j6qdXuZZO',
     'cliente',             'activo', NULL, 14, NULL, NULL),
    ('proveedor@retrosound.com',
     '$2b$10$AdrgkEp5vXJ/410Vbt1cwuFp/HqdFctL7FHPeB24TOz1j6qdXuZZO',
     'proveedor',           'activo', NULL, NULL, NULL, 3)
ON CONFLICT (correo_usuario) DO NOTHING;

COMMIT;

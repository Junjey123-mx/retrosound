-- =============================================================================
-- RetroSound Store - Script de datos de prueba realistas
-- Compatible con el DDL actual en MySQL/MariaDB
-- =============================================================================

USE retrosound;

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM detalle_compra_proveedor;
DELETE FROM compra_proveedor;
DELETE FROM detalle_venta;
DELETE FROM venta;
DELETE FROM usuario;
DELETE FROM producto_genero;
DELETE FROM producto_artista;
DELETE FROM producto;
DELETE FROM proveedor;
DELETE FROM empleado;
DELETE FROM cliente;
DELETE FROM artista;
DELETE FROM genero_musical;
DELETE FROM formato;
DELETE FROM categoria;

ALTER TABLE detalle_compra_proveedor AUTO_INCREMENT = 1;
ALTER TABLE compra_proveedor AUTO_INCREMENT = 1;
ALTER TABLE detalle_venta AUTO_INCREMENT = 1;
ALTER TABLE venta AUTO_INCREMENT = 1;
ALTER TABLE usuario AUTO_INCREMENT = 1;
ALTER TABLE producto AUTO_INCREMENT = 1;
ALTER TABLE proveedor AUTO_INCREMENT = 1;
ALTER TABLE empleado AUTO_INCREMENT = 1;
ALTER TABLE cliente AUTO_INCREMENT = 1;
ALTER TABLE artista AUTO_INCREMENT = 1;
ALTER TABLE genero_musical AUTO_INCREMENT = 1;
ALTER TABLE formato AUTO_INCREMENT = 1;
ALTER TABLE categoria AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categoria (nombre_categoria, descripcion_categoria, estado_categoria) VALUES
('Álbum de estudio', 'Producción musical completa publicada como álbum principal.', 'activo'),
('Álbum recopilatorio', 'Colección de éxitos o canciones destacadas de un artista.', 'activo'),
('Edición especial', 'Versión con contenido adicional, empaque especial o material extra.', 'activo'),
('Reedición', 'Nueva edición de un lanzamiento publicado anteriormente.', 'activo'),
('Sencillo', 'Producto físico con una o pocas canciones promocionales.', 'activo'),
('Edición deluxe', 'Versión extendida con canciones extra o material adicional.', 'activo'),
('Edición limitada', 'Producto con disponibilidad reducida para coleccionistas.', 'activo'),
('Box set', 'Colección física con varios discos o formatos incluidos.', 'activo'),
('Vinilo clásico', 'Lanzamiento en vinilo de álbumes reconocidos.', 'activo'),
('CD estándar', 'Edición física tradicional en disco compacto.', 'activo'),
('Casete retro', 'Edición física en casete para coleccionistas.', 'activo'),
('Soundtrack', 'Banda sonora de película, serie o videojuego.', 'activo'),
('Remasterización', 'Versión con audio remasterizado de un lanzamiento anterior.', 'activo'),
('Edición aniversario', 'Lanzamiento conmemorativo por aniversario del álbum.', 'activo'),
('Importado', 'Producto musical adquirido mediante importación.', 'activo'),
('Nacional', 'Producto distribuido localmente.', 'activo'),
('Colección esencial', 'Selección de canciones representativas del artista.', 'activo'),
('En vivo', 'Grabación de concierto o presentación en vivo.', 'activo'),
('Acústico', 'Versión acústica o unplugged de canciones del artista.', 'activo'),
('Edición fan', 'Lanzamiento orientado a seguidores y coleccionistas.', 'activo'),
('Pack doble', 'Producto con dos discos o dos formatos incluidos.', 'activo'),
('Pack triple', 'Producto con tres discos o contenidos físicos.', 'activo'),
('Edición remixes', 'Lanzamiento con versiones remixadas.', 'activo'),
('Edición internacional', 'Versión publicada para mercado internacional.', 'activo'),
('Producto promocional', 'Artículo musical usado para promoción o campaña.', 'activo');

INSERT INTO formato (nombre_formato, descripcion_formato, estado_formato) VALUES
('Vinilo 12 pulgadas', 'Disco de vinilo de larga duración.', 'activo'),
('Vinilo 7 pulgadas', 'Disco de vinilo pequeño usado para sencillos.', 'activo'),
('CD Jewel Case', 'CD en caja plástica tradicional.', 'activo'),
('CD Digipack', 'CD en empaque de cartón tipo digipack.', 'activo'),
('Casete estándar', 'Casete de audio tradicional.', 'activo'),
('Casete edición limitada', 'Casete para colección con diseño especial.', 'activo'),
('Box set CD', 'Caja con varios discos compactos.', 'activo'),
('Box set vinilo', 'Caja con varios vinilos.', 'activo'),
('CD remasterizado', 'Disco compacto con audio remasterizado.', 'activo'),
('Vinilo color negro', 'Vinilo tradicional en color negro.', 'activo'),
('Vinilo color rojo', 'Vinilo de color rojo para colección.', 'activo'),
('Vinilo color azul', 'Vinilo de color azul para colección.', 'activo'),
('Vinilo transparente', 'Vinilo transparente de edición especial.', 'activo'),
('Picture Disc', 'Vinilo con imagen impresa en el disco.', 'activo'),
('Mini CD', 'Disco compacto de tamaño reducido.', 'activo'),
('DVD musical', 'Formato DVD con conciertos o contenido musical.', 'activo'),
('Blu-ray musical', 'Formato Blu-ray con conciertos o contenido audiovisual.', 'activo'),
('USB musical', 'Memoria USB con contenido musical autorizado.', 'activo'),
('Cassette doble', 'Pack con dos casetes.', 'activo'),
('CD doble', 'Lanzamiento con dos discos compactos.', 'activo'),
('Vinilo doble', 'Lanzamiento con dos discos de vinilo.', 'activo'),
('Edición libro CD', 'CD incluido en empaque tipo libro.', 'activo'),
('Edición libro vinilo', 'Vinilo incluido en empaque tipo libro.', 'activo'),
('Formato importado', 'Formato físico importado.', 'activo'),
('Formato coleccionista', 'Formato especial para colección.', 'activo');

INSERT INTO genero_musical (nombre_genero_musical, descripcion_genero_musical, estado_genero_musical) VALUES
('Rock alternativo', 'Género derivado del rock con sonidos alternativos.', 'activo'),
('Rap', 'Género basado en rimas, ritmo y expresión lírica.', 'activo'),
('Rock en español', 'Rock interpretado principalmente en idioma español.', 'activo'),
('Reguetón', 'Género urbano latino con base rítmica bailable.', 'activo'),
('Pop', 'Música popular orientada a públicos amplios.', 'activo'),
('R&B', 'Género con influencias de soul, pop y rhythm and blues.', 'activo'),
('Electrónica', 'Música basada en producción digital y sintetizadores.', 'activo'),
('Industrial rock', 'Rock con elementos electrónicos e industriales.', 'activo'),
('Dance pop', 'Pop con orientación bailable.', 'activo'),
('EDM', 'Música electrónica orientada a festivales y clubes.', 'activo'),
('Trip hop', 'Género con mezcla de electrónica, hip hop y atmósferas oscuras.', 'activo'),
('Funk', 'Género rítmico con fuerte presencia de bajo y groove.', 'activo'),
('Soul', 'Género vocal influenciado por gospel y rhythm and blues.', 'activo'),
('Ska punk', 'Mezcla de ska, punk y pop rock.', 'activo'),
('House', 'Género electrónico bailable de base repetitiva.', 'activo'),
('Metal', 'Género pesado con guitarras distorsionadas.', 'activo'),
('Hard rock', 'Rock con sonido fuerte y guitarras marcadas.', 'activo'),
('Grunge', 'Subgénero del rock alternativo popularizado en los años noventa.', 'activo'),
('Hip hop', 'Cultura musical urbana basada en rap y beats.', 'activo'),
('Rap clásico', 'Rap de estilo clásico y lírico.', 'activo'),
('Pop latino', 'Pop con influencia latina.', 'activo'),
('Rock latino', 'Rock interpretado por artistas latinoamericanos.', 'activo'),
('Folk latino', 'Música con raíces folclóricas latinoamericanas.', 'activo'),
('Synth pop', 'Pop basado en sintetizadores.', 'activo'),
('Nu metal', 'Metal con elementos de rap, rock alternativo y electrónica.', 'activo');

INSERT INTO artista (nombre_artista, pais_origen_artista, anio_inicio_artista, estado_artista) VALUES
('Linkin Park', 'Estados Unidos', 1996, 'activo'),
('Eminem', 'Estados Unidos', 1988, 'activo'),
('Héroes del Silencio', 'España', 1984, 'activo'),
('Wisin y Yandel', 'Puerto Rico', 1998, 'activo'),
('Michael Jackson', 'Estados Unidos', 1964, 'activo'),
('The Neighbourhood', 'Estados Unidos', 2011, 'activo'),
('Daft Punk', 'Francia', 1993, 'activo'),
('Marilyn Manson', 'Estados Unidos', 1989, 'activo'),
('Lady Gaga', 'Estados Unidos', 2005, 'activo'),
('Katy Perry', 'Estados Unidos', 2001, 'activo'),
('David Guetta', 'Francia', 1984, 'activo'),
('Gorillaz', 'Reino Unido', 1998, 'activo'),
('Madonna', 'Estados Unidos', 1979, 'activo'),
('Rihanna', 'Barbados', 2003, 'activo'),
('Alicia Keys', 'Estados Unidos', 1996, 'activo'),
('No Doubt', 'Estados Unidos', 1986, 'activo'),
('Tiësto', 'Países Bajos', 1994, 'activo'),
('Metallica', 'Estados Unidos', 1981, 'activo'),
('Skillet', 'Estados Unidos', 1996, 'activo'),
('Nirvana', 'Estados Unidos', 1987, 'activo'),
('Dr. Dre', 'Estados Unidos', 1985, 'activo'),
('Nas', 'Estados Unidos', 1991, 'activo'),
('Juanes', 'Colombia', 1987, 'activo'),
('Maná', 'México', 1986, 'activo'),
('Natalia Lafourcade', 'México', 1998, 'activo');

INSERT INTO producto (
    titulo_producto, descripcion_producto, anio_lanzamiento, precio_venta,
    stock_actual, stock_minimo, codigo_sku, estado_producto,
    fecha_inactivacion, id_categoria, id_formato
) VALUES
('Hybrid Theory', 'Álbum físico de Linkin Park en edición de colección.', 2000, 249.99, 18, 5, 'RS-LP-HT-001', 'activo', NULL, 1, 1),
('The Marshall Mathers LP', 'Álbum físico de Eminem en edición estándar.', 2000, 219.99, 14, 4, 'RS-EM-MMLP-002', 'activo', NULL, 1, 3),
('Senderos de Traición', 'Álbum clásico de Héroes del Silencio en formato físico.', 1990, 199.99, 11, 3, 'RS-HS-SDT-003', 'activo', NULL, 4, 4),
('Pa’l Mundo', 'Álbum físico de Wisin y Yandel con éxitos urbanos.', 2005, 189.99, 20, 5, 'RS-WY-PM-004', 'activo', NULL, 1, 3),
('Thriller', 'Álbum icónico de Michael Jackson en edición física.', 1982, 299.99, 25, 6, 'RS-MJ-TH-005', 'activo', NULL, 13, 8),
('I Love You.', 'Álbum de The Neighbourhood en edición física.', 2013, 209.99, 12, 4, 'RS-TN-ILY-006', 'activo', NULL, 1, 10),
('Random Access Memories', 'Álbum de Daft Punk en edición física de colección.', 2013, 279.99, 16, 5, 'RS-DP-RAM-007', 'activo', NULL, 3, 21),
('Antichrist Superstar', 'Álbum de Marilyn Manson en formato físico.', 1996, 229.99, 9, 3, 'RS-MM-AS-008', 'activo', NULL, 1, 5),
('The Fame', 'Álbum debut de Lady Gaga en edición CD.', 2008, 189.99, 17, 5, 'RS-LG-TF-009', 'activo', NULL, 10, 3),
('Teenage Dream', 'Álbum pop de Katy Perry en edición física.', 2010, 199.99, 15, 4, 'RS-KP-TD-010', 'activo', NULL, 6, 4),
('Nothing but the Beat', 'Álbum de David Guetta con enfoque electrónico.', 2011, 209.99, 18, 5, 'RS-DG-NBTB-011', 'activo', NULL, 23, 3),
('Demon Days', 'Álbum físico de Gorillaz en edición estándar.', 2005, 229.99, 13, 4, 'RS-GZ-DD-012', 'activo', NULL, 1, 1),
('Like a Virgin', 'Álbum clásico de Madonna en edición física.', 1984, 199.99, 10, 3, 'RS-MD-LAV-013', 'activo', NULL, 9, 10),
('Good Girl Gone Bad', 'Álbum físico de Rihanna en edición CD.', 2007, 189.99, 16, 4, 'RS-RH-GGGB-014', 'activo', NULL, 10, 3),
('Songs in A Minor', 'Álbum de Alicia Keys en formato físico.', 2001, 199.99, 14, 4, 'RS-AK-SIAM-015', 'activo', NULL, 1, 4),
('Tragic Kingdom', 'Álbum de No Doubt en edición física.', 1995, 219.99, 8, 3, 'RS-ND-TK-016', 'activo', NULL, 4, 5),
('Elements of Life', 'Álbum de Tiësto en formato físico.', 2007, 209.99, 15, 4, 'RS-TS-EOL-017', 'activo', NULL, 23, 3),
('Master of Puppets', 'Álbum de Metallica en edición física.', 1986, 259.99, 12, 4, 'RS-MT-MOP-018', 'activo', NULL, 13, 1),
('Comatose', 'Álbum de Skillet en edición CD.', 2006, 189.99, 11, 3, 'RS-SK-COM-019', 'activo', NULL, 1, 3),
('Nevermind', 'Álbum de Nirvana en edición física.', 1991, 249.99, 19, 5, 'RS-NV-NM-020', 'activo', NULL, 13, 8),
('The Chronic', 'Álbum clásico de Dr. Dre en formato físico.', 1992, 229.99, 10, 3, 'RS-DD-TC-021', 'activo', NULL, 17, 3),
('Illmatic', 'Álbum de Nas en edición física.', 1994, 219.99, 9, 3, 'RS-NS-ILL-022', 'activo', NULL, 17, 4),
('Un Día Normal', 'Álbum de Juanes en edición física.', 2002, 189.99, 14, 4, 'RS-JN-UDN-023', 'activo', NULL, 16, 3),
('¿Dónde Jugarán los Niños?', 'Álbum clásico de Maná en formato físico.', 1992, 209.99, 13, 4, 'RS-MA-DJLN-024', 'activo', NULL, 4, 5),
('Hasta la Raíz', 'Álbum de Natalia Lafourcade en edición física.', 2015, 199.99, 15, 4, 'RS-NL-HLR-025', 'activo', NULL, 6, 4);

INSERT INTO producto_artista (id_producto, id_artista) VALUES
(1, 1),(2, 2),(3, 3),(4, 4),(5, 5),(6, 6),(7, 7),(8, 8),(9, 9),(10, 10),
(11, 11),(12, 12),(13, 13),(14, 14),(15, 15),(16, 16),(17, 17),(18, 18),(19, 19),(20, 20),
(21, 21),(22, 22),(23, 23),(24, 24),(25, 25);

INSERT INTO producto_genero (id_producto, id_genero_musical) VALUES
(1, 25),(2, 2),(3, 3),(4, 4),(5, 5),(6, 1),(7, 7),(8, 8),(9, 9),(10, 5),
(11, 10),(12, 11),(13, 5),(14, 6),(15, 13),(16, 14),(17, 15),(18, 16),(19, 17),(20, 18),
(21, 19),(22, 20),(23, 21),(24, 22),(25, 23);

INSERT INTO cliente (
    nombre_cliente, apellido_cliente, telefono_cliente, correo_cliente,
    direccion_cliente, fecha_registro_cliente, estado_cliente, fecha_inactivacion
) VALUES
('Andrea', 'García', '5551-1001', 'andrea.garcia@email.com', 'Zona 1, Ciudad de Guatemala', '2026-01-05', 'activo', NULL),
('Mario', 'López', '5551-1002', 'mario.lopez@email.com', 'Zona 2, Ciudad de Guatemala', '2026-01-06', 'activo', NULL),
('Sofía', 'Ramírez', '5551-1003', 'sofia.ramirez@email.com', 'Zona 3, Ciudad de Guatemala', '2026-01-07', 'activo', NULL),
('Daniel', 'Castro', '5551-1004', 'daniel.castro@email.com', 'Zona 4, Ciudad de Guatemala', '2026-01-08', 'activo', NULL),
('Valeria', 'Pérez', '5551-1005', 'valeria.perez@email.com', 'Zona 5, Ciudad de Guatemala', '2026-01-09', 'activo', NULL),
('Luis', 'Morales', '5551-1006', 'luis.morales@email.com', 'Zona 6, Mixco', '2026-01-10', 'activo', NULL),
('Camila', 'Herrera', '5551-1007', 'camila.herrera@email.com', 'Zona 7, Mixco', '2026-01-11', 'activo', NULL),
('José', 'Méndez', '5551-1008', 'jose.mendez@email.com', 'Zona 8, Villa Nueva', '2026-01-12', 'activo', NULL),
('Fernanda', 'Ortiz', '5551-1009', 'fernanda.ortiz@email.com', 'Zona 9, Ciudad de Guatemala', '2026-01-13', 'activo', NULL),
('Carlos', 'Ruiz', '5551-1010', 'carlos.ruiz@email.com', 'Zona 10, Ciudad de Guatemala', '2026-01-14', 'activo', NULL),
('Paola', 'Vásquez', '5551-1011', 'paola.vasquez@email.com', 'Zona 11, Ciudad de Guatemala', '2026-01-15', 'activo', NULL),
('Javier', 'Flores', '5551-1012', 'javier.flores@email.com', 'Zona 12, Ciudad de Guatemala', '2026-01-16', 'activo', NULL),
('Gabriela', 'Santos', '5551-1013', 'gabriela.santos@email.com', 'Zona 13, Ciudad de Guatemala', '2026-01-17', 'activo', NULL),
('Ricardo', 'Reyes', '5551-1014', 'ricardo.reyes@email.com', 'Zona 14, Ciudad de Guatemala', '2026-01-18', 'activo', NULL),
('María', 'Cruz', '5551-1015', 'maria.cruz@email.com', 'Zona 15, Ciudad de Guatemala', '2026-01-19', 'activo', NULL),
('Kevin', 'Aguilar', '5551-1016', 'kevin.aguilar@email.com', 'Zona 16, Ciudad de Guatemala', '2026-01-20', 'activo', NULL),
('Lucía', 'Molina', '5551-1017', 'lucia.molina@email.com', 'Zona 17, Ciudad de Guatemala', '2026-01-21', 'activo', NULL),
('Diego', 'Navarro', '5551-1018', 'diego.navarro@email.com', 'Zona 18, Ciudad de Guatemala', '2026-01-22', 'activo', NULL),
('Alejandra', 'Ramos', '5551-1019', 'alejandra.ramos@email.com', 'Antigua Guatemala', '2026-01-23', 'activo', NULL),
('Sebastián', 'Gómez', '5551-1020', 'sebastian.gomez@email.com', 'San Lucas Sacatepéquez', '2026-01-24', 'activo', NULL),
('Natalia', 'Chávez', '5551-1021', 'natalia.chavez@email.com', 'Santa Catarina Pinula', '2026-01-25', 'activo', NULL),
('Héctor', 'Fuentes', '5551-1022', 'hector.fuentes@email.com', 'Fraijanes', '2026-01-26', 'activo', NULL),
('Mónica', 'Salazar', '5551-1023', 'monica.salazar@email.com', 'Carretera a El Salvador', '2026-01-27', 'activo', NULL),
('Samuel', 'Robledo', '5551-1024', 'samuel.robledo@email.com', 'Zona 21, Ciudad de Guatemala', '2026-01-28', 'activo', NULL),
('Derek', 'Hernández', '5551-1025', 'derek.hernandez@email.com', 'Zona 11, Ciudad de Guatemala', '2026-01-29', 'activo', NULL);

INSERT INTO empleado (
    nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado,
    fecha_contratacion, estado_empleado, fecha_inactivacion
) VALUES
('Vernel', 'Hernández', '4210-1001', 'vernel.hernandez@retrosound.com', '2025-01-10', 'activo', NULL),
('Ángel', 'Sanabria', '4210-1002', 'angel.sanabria@retrosound.com', '2025-01-12', 'activo', NULL),
('Saul', 'Castillo', '4210-1003', 'saul.castillo@retrosound.com', '2025-01-15', 'activo', NULL),
('Paola', 'Hernández', '4210-1004', 'paola.hernandez@retrosound.com', '2025-02-01', 'activo', NULL),
('Carlos', 'Mendoza', '4210-1005', 'carlos.mendoza@retrosound.com', '2025-02-05', 'activo', NULL),
('María', 'López', '4210-1006', 'maria.lopez@retrosound.com', '2025-02-08', 'activo', NULL),
('Luis', 'Martínez', '4210-1007', 'luis.martinez@retrosound.com', '2025-02-12', 'activo', NULL),
('Ana', 'Morales', '4210-1008', 'ana.morales@retrosound.com', '2025-02-15', 'activo', NULL),
('José', 'Ramírez', '4210-1009', 'jose.ramirez@retrosound.com', '2025-02-20', 'activo', NULL),
('Gabriela', 'Pérez', '4210-1010', 'gabriela.perez@retrosound.com', '2025-02-25', 'activo', NULL),
('Fernando', 'Gómez', '4210-1011', 'fernando.gomez@retrosound.com', '2025-03-01', 'activo', NULL),
('Lucía', 'Díaz', '4210-1012', 'lucia.diaz@retrosound.com', '2025-03-05', 'activo', NULL),
('Ricardo', 'Ortiz', '4210-1013', 'ricardo.ortiz@retrosound.com', '2025-03-08', 'activo', NULL),
('Andrea', 'Flores', '4210-1014', 'andrea.flores@retrosound.com', '2025-03-12', 'activo', NULL),
('Mario', 'Reyes', '4210-1015', 'mario.reyes@retrosound.com', '2025-03-16', 'activo', NULL),
('Sofía', 'Navarro', '4210-1016', 'sofia.navarro@retrosound.com', '2025-03-20', 'activo', NULL),
('Daniel', 'Cruz', '4210-1017', 'daniel.cruz@retrosound.com', '2025-03-24', 'activo', NULL),
('Camila', 'Vásquez', '4210-1018', 'camila.vasquez@retrosound.com', '2025-04-01', 'activo', NULL),
('Javier', 'Santos', '4210-1019', 'javier.santos@retrosound.com', '2025-04-05', 'activo', NULL),
('Natalia', 'Aguilar', '4210-1020', 'natalia.aguilar@retrosound.com', '2025-04-10', 'activo', NULL),
('Héctor', 'Molina', '4210-1021', 'hector.molina@retrosound.com', '2025-04-15', 'activo', NULL),
('Mónica', 'Fuentes', '4210-1022', 'monica.fuentes@retrosound.com', '2025-04-20', 'activo', NULL),
('Samuel', 'Castro', '4210-1023', 'samuel.castro@retrosound.com', '2025-04-25', 'activo', NULL),
('Diana', 'Salazar', '4210-1024', 'diana.salazar@retrosound.com', '2025-05-01', 'activo', NULL),
('Esteban', 'Herrera', '4210-1025', 'esteban.herrera@retrosound.com', '2025-05-05', 'activo', NULL);

INSERT INTO proveedor (
    nombre_proveedor, telefono_proveedor, correo_proveedor, direccion_proveedor,
    nombre_contacto_proveedor, estado_proveedor, fecha_inactivacion
) VALUES
('Distribuidora Musical Guatemala', '2300-1001', 'ventas@dmg.com.gt', 'Zona 4, Ciudad de Guatemala', 'Carlos Méndez', 'activo', NULL),
('Vinyl Import Central', '2300-1002', 'contacto@vinylimport.com', 'Zona 10, Ciudad de Guatemala', 'Ana Morales', 'activo', NULL),
('Retro Music Supply', '2300-1003', 'pedidos@retromusic.com', 'Zona 1, Ciudad de Guatemala', 'Luis Herrera', 'activo', NULL),
('AudioMarket GT', '2300-1004', 'ventas@audiomarketgt.com', 'Mixco, Guatemala', 'María López', 'activo', NULL),
('Classic Records', '2300-1005', 'info@classicrecords.com', 'Antigua Guatemala', 'José Castillo', 'activo', NULL),
('Global Music Imports', '2300-1006', 'sales@globalmusic.com', 'Zona 13, Ciudad de Guatemala', 'Fernanda Ortiz', 'activo', NULL),
('Sonido Pro S.A.', '2300-1007', 'contacto@sonidopro.com.gt', 'Zona 9, Ciudad de Guatemala', 'Daniel Ruiz', 'activo', NULL),
('CD Warehouse GT', '2300-1008', 'ventas@cdwarehouse.gt', 'Villa Nueva, Guatemala', 'Paola Reyes', 'activo', NULL),
('Cassette Revival', '2300-1009', 'orders@cassetterevival.com', 'Zona 11, Ciudad de Guatemala', 'Ricardo Gómez', 'activo', NULL),
('Music Collector Hub', '2300-1010', 'info@collectorhub.com', 'Zona 15, Ciudad de Guatemala', 'Gabriela Pérez', 'activo', NULL),
('Importadora Melodía', '2300-1011', 'ventas@melodia.gt', 'Zona 7, Mixco', 'Mario Santos', 'activo', NULL),
('RockStock Distribución', '2300-1012', 'contacto@rockstock.com', 'Zona 12, Ciudad de Guatemala', 'Lucía Flores', 'activo', NULL),
('Pop Records Supply', '2300-1013', 'ventas@poprecords.com', 'Zona 14, Ciudad de Guatemala', 'Javier Navarro', 'activo', NULL),
('Latino Music Center', '2300-1014', 'pedidos@latinomusic.com', 'Zona 5, Ciudad de Guatemala', 'Camila Cruz', 'activo', NULL),
('Electronic Beats Imports', '2300-1015', 'sales@electrobeats.com', 'Zona 16, Ciudad de Guatemala', 'Héctor Molina', 'activo', NULL),
('Urban Music Supply', '2300-1016', 'ventas@urbanmusic.com', 'Zona 18, Ciudad de Guatemala', 'Mónica Fuentes', 'activo', NULL),
('Colecciones Musicales GT', '2300-1017', 'info@coleccionesgt.com', 'Fraijanes, Guatemala', 'Natalia Chávez', 'activo', NULL),
('Vinilo Selecto', '2300-1018', 'contacto@viniloselecto.gt', 'San Lucas Sacatepéquez', 'Esteban Herrera', 'activo', NULL),
('Mundo CD', '2300-1019', 'ventas@mundocd.gt', 'Zona 3, Ciudad de Guatemala', 'Diana Salazar', 'activo', NULL),
('Casetes y Más', '2300-1020', 'info@casetesymas.gt', 'Zona 2, Ciudad de Guatemala', 'Samuel Castro', 'activo', NULL),
('Music Box International', '2300-1021', 'sales@musicbox.com', 'Zona 6, Ciudad de Guatemala', 'Andrea García', 'activo', NULL),
('Record Store Partners', '2300-1022', 'partners@recordstore.com', 'Zona 8, Ciudad de Guatemala', 'Diego Ramírez', 'activo', NULL),
('Ediciones Deluxe GT', '2300-1023', 'ventas@deluxegt.com', 'Zona 17, Ciudad de Guatemala', 'Sofía Morales', 'activo', NULL),
('Discos del Centro', '2300-1024', 'contacto@discoscentro.gt', 'Zona 1, Ciudad de Guatemala', 'Kevin Aguilar', 'activo', NULL),
('Importaciones RetroSound', '2300-1025', 'import@retrosound.com', 'Zona 10, Ciudad de Guatemala', 'Valeria Pérez', 'activo', NULL);

INSERT INTO usuario (
    correo_usuario, contrasena_hash, rol_usuario, estado_usuario,
    fecha_inactivacion, id_cliente, id_empleado, id_proveedor
) VALUES
('admin@retrosound.com', '$2b$10$hashdemo001', 'admin', 'activo', NULL, NULL, 1, NULL),
('angel.sanabria@retrosound.com', '$2b$10$hashdemo002', 'empleado', 'activo', NULL, NULL, 2, NULL),
('saul.castillo@retrosound.com', '$2b$10$hashdemo003', 'empleado', 'activo', NULL, NULL, 3, NULL),
('paola.hernandez@retrosound.com', '$2b$10$hashdemo004', 'empleado', 'activo', NULL, NULL, 4, NULL),
('carlos.mendoza@retrosound.com', '$2b$10$hashdemo005', 'empleado', 'activo', NULL, NULL, 5, NULL),
('maria.lopez@retrosound.com', '$2b$10$hashdemo006', 'empleado', 'activo', NULL, NULL, 6, NULL),
('luis.martinez@retrosound.com', '$2b$10$hashdemo007', 'empleado', 'activo', NULL, NULL, 7, NULL),
('ana.morales@retrosound.com', '$2b$10$hashdemo008', 'empleado', 'activo', NULL, NULL, 8, NULL),
('jose.ramirez@retrosound.com', '$2b$10$hashdemo009', 'empleado', 'activo', NULL, NULL, 9, NULL),
('gabriela.perez@retrosound.com', '$2b$10$hashdemo010', 'empleado', 'activo', NULL, NULL, 10, NULL),
('andrea.garcia@email.com', '$2b$10$hashdemo011', 'cliente', 'activo', NULL, 1, NULL, NULL),
('mario.lopez@email.com', '$2b$10$hashdemo012', 'cliente', 'activo', NULL, 2, NULL, NULL),
('sofia.ramirez@email.com', '$2b$10$hashdemo013', 'cliente', 'activo', NULL, 3, NULL, NULL),
('daniel.castro@email.com', '$2b$10$hashdemo014', 'cliente', 'activo', NULL, 4, NULL, NULL),
('valeria.perez@email.com', '$2b$10$hashdemo015', 'cliente', 'activo', NULL, 5, NULL, NULL),
('luis.morales@email.com', '$2b$10$hashdemo016', 'cliente', 'activo', NULL, 6, NULL, NULL),
('camila.herrera@email.com', '$2b$10$hashdemo017', 'cliente', 'activo', NULL, 7, NULL, NULL),
('jose.mendez@email.com', '$2b$10$hashdemo018', 'cliente', 'activo', NULL, 8, NULL, NULL),
('fernanda.ortiz@email.com', '$2b$10$hashdemo019', 'cliente', 'activo', NULL, 9, NULL, NULL),
('carlos.ruiz@email.com', '$2b$10$hashdemo020', 'cliente', 'activo', NULL, 10, NULL, NULL),
('paola.vasquez@email.com', '$2b$10$hashdemo021', 'cliente', 'activo', NULL, 11, NULL, NULL),
('javier.flores@email.com', '$2b$10$hashdemo022', 'cliente', 'activo', NULL, 12, NULL, NULL),
('gabriela.santos@email.com', '$2b$10$hashdemo023', 'cliente', 'activo', NULL, 13, NULL, NULL),
('proveedor1@retrosound.com', '$2b$10$hashdemo024', 'proveedor', 'activo', NULL, NULL, NULL, 1),
('proveedor2@retrosound.com', '$2b$10$hashdemo025', 'proveedor', 'activo', NULL, NULL, NULL, 2);

INSERT INTO venta (
    fecha_venta, descuento_venta, metodo_pago, estado_venta, id_cliente, id_empleado
) VALUES
('2026-04-01', 0.00, 'efectivo', 'completada', 1, 1),
('2026-04-01', 10.00, 'tarjeta', 'completada', 2, 2),
('2026-04-02', 0.00, 'transferencia', 'completada', 3, 3),
('2026-04-02', 5.00, 'efectivo', 'completada', 4, 4),
('2026-04-03', 0.00, 'tarjeta', 'completada', 5, 5),
('2026-04-03', 15.00, 'transferencia', 'completada', 6, 6),
('2026-04-04', 0.00, 'efectivo', 'completada', 7, 7),
('2026-04-04', 0.00, 'tarjeta', 'pendiente', 8, 8),
('2026-04-05', 20.00, 'transferencia', 'completada', 9, 9),
('2026-04-05', 0.00, 'efectivo', 'completada', 10, 10),
('2026-04-06', 0.00, 'tarjeta', 'completada', 11, 11),
('2026-04-06', 10.00, 'transferencia', 'completada', 12, 12),
('2026-04-07', 0.00, 'efectivo', 'completada', 13, 13),
('2026-04-07', 0.00, 'tarjeta', 'cancelada', 14, 14),
('2026-04-08', 5.00, 'transferencia', 'completada', 15, 15),
('2026-04-08', 0.00, 'efectivo', 'completada', 16, 16),
('2026-04-09', 0.00, 'tarjeta', 'completada', 17, 17),
('2026-04-09', 10.00, 'transferencia', 'completada', 18, 18),
('2026-04-10', 0.00, 'efectivo', 'completada', 19, 19),
('2026-04-10', 0.00, 'tarjeta', 'completada', 20, 20),
('2026-04-11', 5.00, 'transferencia', 'completada', 21, 21),
('2026-04-11', 0.00, 'efectivo', 'pendiente', 22, 22),
('2026-04-12', 0.00, 'tarjeta', 'completada', 23, 23),
('2026-04-12', 15.00, 'transferencia', 'completada', 24, 24),
('2026-04-13', 0.00, 'efectivo', 'completada', 25, 25);

INSERT INTO detalle_venta (
    id_venta, id_producto, cantidad_vendida, precio_unitario_venta, descuento_detalle
) VALUES
(1, 1, 1, 249.99, 0.00),(2, 2, 1, 219.99, 5.00),(3, 3, 1, 199.99, 0.00),(4, 4, 2, 189.99, 10.00),
(5, 5, 1, 299.99, 0.00),(6, 6, 1, 209.99, 5.00),(7, 7, 1, 279.99, 0.00),(8, 8, 1, 229.99, 0.00),
(9, 9, 2, 189.99, 15.00),(10, 10, 1, 199.99, 0.00),(11, 11, 1, 209.99, 0.00),(12, 12, 1, 229.99, 5.00),
(13, 13, 1, 199.99, 0.00),(14, 14, 1, 189.99, 0.00),(15, 15, 2, 199.99, 10.00),(16, 16, 1, 219.99, 0.00),
(17, 17, 1, 209.99, 0.00),(18, 18, 1, 259.99, 5.00),(19, 19, 1, 189.99, 0.00),(20, 20, 1, 249.99, 0.00),
(21, 21, 1, 229.99, 5.00),(22, 22, 1, 219.99, 0.00),(23, 23, 2, 189.99, 10.00),(24, 24, 1, 209.99, 5.00),
(25, 25, 1, 199.99, 0.00);

INSERT INTO compra_proveedor (
    fecha_compra_proveedor, estado_compra, id_proveedor, id_empleado
) VALUES
('2026-03-01', 'recibida', 1, 1),('2026-03-01', 'recibida', 2, 2),('2026-03-02', 'recibida', 3, 3),('2026-03-02', 'recibida', 4, 4),
('2026-03-03', 'recibida', 5, 5),('2026-03-03', 'recibida', 6, 6),('2026-03-04', 'recibida', 7, 7),('2026-03-04', 'pendiente', 8, 8),
('2026-03-05', 'recibida', 9, 9),('2026-03-05', 'recibida', 10, 10),('2026-03-06', 'recibida', 11, 11),('2026-03-06', 'cancelada', 12, 12),
('2026-03-07', 'recibida', 13, 13),('2026-03-07', 'recibida', 14, 14),('2026-03-08', 'recibida', 15, 15),('2026-03-08', 'pendiente', 16, 16),
('2026-03-09', 'recibida', 17, 17),('2026-03-09', 'recibida', 18, 18),('2026-03-10', 'recibida', 19, 19),('2026-03-10', 'recibida', 20, 20),
('2026-03-11', 'recibida', 21, 21),('2026-03-11', 'recibida', 22, 22),('2026-03-12', 'recibida', 23, 23),('2026-03-12', 'recibida', 24, 24),
('2026-03-13', 'recibida', 25, 25);

INSERT INTO detalle_compra_proveedor (
    id_compra_proveedor, id_producto, cantidad_comprada, costo_unitario_compra
) VALUES
(1, 1, 20, 145.00),(2, 2, 18, 130.00),(3, 3, 15, 115.00),(4, 4, 25, 105.00),(5, 5, 30, 180.00),
(6, 6, 16, 120.00),(7, 7, 22, 165.00),(8, 8, 12, 135.00),(9, 9, 20, 100.00),(10, 10, 18, 110.00),
(11, 11, 24, 125.00),(12, 12, 14, 140.00),(13, 13, 15, 115.00),(14, 14, 20, 105.00),(15, 15, 18, 110.00),
(16, 16, 12, 125.00),(17, 17, 20, 120.00),(18, 18, 16, 150.00),(19, 19, 14, 105.00),(20, 20, 25, 145.00),
(21, 21, 15, 130.00),(22, 22, 12, 125.00),(23, 23, 20, 105.00),(24, 24, 18, 115.00),(25, 25, 20, 110.00);

COMMIT;

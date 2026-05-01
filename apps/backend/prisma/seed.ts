import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Borrar todo en orden inverso de FK ──────────────────────────────────
  await prisma.detalleCompraProveedor.deleteMany();
  await prisma.compraProveedor.deleteMany();
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.productoGenero.deleteMany();
  await prisma.productoArtista.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.artista.deleteMany();
  await prisma.generoMusical.deleteMany();
  await prisma.formato.deleteMany();
  await prisma.categoria.deleteMany();

  // ── 2. Resetear secuencias ────────────────────────────────────────────────
  const seqs = [
    'categoria_id_categoria_seq',
    'formato_id_formato_seq',
    'genero_musical_id_genero_musical_seq',
    'artista_id_artista_seq',
    'producto_id_producto_seq',
    'cliente_id_cliente_seq',
    'empleado_id_empleado_seq',
    'proveedor_id_proveedor_seq',
    'usuario_id_usuario_seq',
    'venta_id_venta_seq',
    'detalle_venta_id_detalle_venta_seq',
    'compra_proveedor_id_compra_proveedor_seq',
    'detalle_compra_proveedor_id_detalle_compra_proveedor_seq',
  ];
  for (const seq of seqs) {
    await prisma.$executeRawUnsafe(`SELECT setval('${seq}', 1, false)`);
  }

  // ── 3. Hash compartido (contraseña demo: retro2025) ───────────────────────
  const demoHash = await bcrypt.hash('retro2025', 10);

  // ── 4. Categorías ─────────────────────────────────────────────────────────
  await prisma.categoria.createMany({
    data: [
      { nombre: 'Álbum de estudio',    descripcion: 'Producción musical completa publicada como álbum principal.' },
      { nombre: 'Álbum recopilatorio', descripcion: 'Colección de éxitos o canciones destacadas de un artista.' },
      { nombre: 'Edición especial',    descripcion: 'Versión con contenido adicional, empaque especial o material extra.' },
      { nombre: 'Reedición',           descripcion: 'Nueva edición de un lanzamiento publicado anteriormente.' },
      { nombre: 'Sencillo',            descripcion: 'Producto físico con una o pocas canciones promocionales.' },
      { nombre: 'Edición deluxe',      descripcion: 'Versión extendida con canciones extra o material adicional.' },
      { nombre: 'Edición limitada',    descripcion: 'Producto con disponibilidad reducida para coleccionistas.' },
      { nombre: 'Box set',             descripcion: 'Colección física con varios discos o formatos incluidos.' },
      { nombre: 'Vinilo clásico',      descripcion: 'Lanzamiento en vinilo de álbumes reconocidos.' },
      { nombre: 'CD estándar',         descripcion: 'Edición física tradicional en disco compacto.' },
      { nombre: 'Casete retro',        descripcion: 'Edición física en casete para coleccionistas.' },
      { nombre: 'Soundtrack',          descripcion: 'Banda sonora de película, serie o videojuego.' },
      { nombre: 'Remasterización',     descripcion: 'Versión con audio remasterizado de un lanzamiento anterior.' },
      { nombre: 'Edición aniversario', descripcion: 'Lanzamiento conmemorativo por aniversario del álbum.' },
      { nombre: 'Importado',           descripcion: 'Producto musical adquirido mediante importación.' },
      { nombre: 'Nacional',            descripcion: 'Producto distribuido localmente.' },
      { nombre: 'Colección esencial',  descripcion: 'Selección de canciones representativas del artista.' },
      { nombre: 'En vivo',             descripcion: 'Grabación de concierto o presentación en vivo.' },
      { nombre: 'Acústico',            descripcion: 'Versión acústica o unplugged de canciones del artista.' },
      { nombre: 'Edición fan',         descripcion: 'Lanzamiento orientado a seguidores y coleccionistas.' },
      { nombre: 'Pack doble',          descripcion: 'Producto con dos discos o dos formatos incluidos.' },
      { nombre: 'Pack triple',         descripcion: 'Producto con tres discos o contenidos físicos.' },
      { nombre: 'Edición remixes',     descripcion: 'Lanzamiento con versiones remixadas.' },
      { nombre: 'Edición internacional', descripcion: 'Versión publicada para mercado internacional.' },
      { nombre: 'Producto promocional',  descripcion: 'Artículo musical usado para promoción o campaña.' },
    ],
  });

  // ── 5. Formatos ───────────────────────────────────────────────────────────
  await prisma.formato.createMany({
    data: [
      { nombre: 'Vinilo 12 pulgadas',       descripcion: 'Disco de vinilo de larga duración.' },
      { nombre: 'Vinilo 7 pulgadas',        descripcion: 'Disco de vinilo pequeño usado para sencillos.' },
      { nombre: 'CD Jewel Case',            descripcion: 'CD en caja plástica tradicional.' },
      { nombre: 'CD Digipack',              descripcion: 'CD en empaque de cartón tipo digipack.' },
      { nombre: 'Casete estándar',          descripcion: 'Casete de audio tradicional.' },
      { nombre: 'Casete edición limitada',  descripcion: 'Casete para colección con diseño especial.' },
      { nombre: 'Box set CD',               descripcion: 'Caja con varios discos compactos.' },
      { nombre: 'Box set vinilo',           descripcion: 'Caja con varios vinilos.' },
      { nombre: 'CD remasterizado',         descripcion: 'Disco compacto con audio remasterizado.' },
      { nombre: 'Vinilo color negro',       descripcion: 'Vinilo tradicional en color negro.' },
      { nombre: 'Vinilo color rojo',        descripcion: 'Vinilo de color rojo para colección.' },
      { nombre: 'Vinilo color azul',        descripcion: 'Vinilo de color azul para colección.' },
      { nombre: 'Vinilo transparente',      descripcion: 'Vinilo transparente de edición especial.' },
      { nombre: 'Picture Disc',             descripcion: 'Vinilo con imagen impresa en el disco.' },
      { nombre: 'Mini CD',                  descripcion: 'Disco compacto de tamaño reducido.' },
      { nombre: 'DVD musical',              descripcion: 'Formato DVD con conciertos o contenido musical.' },
      { nombre: 'Blu-ray musical',          descripcion: 'Formato Blu-ray con conciertos o contenido audiovisual.' },
      { nombre: 'USB musical',              descripcion: 'Memoria USB con contenido musical autorizado.' },
      { nombre: 'Cassette doble',           descripcion: 'Pack con dos casetes.' },
      { nombre: 'CD doble',                 descripcion: 'Lanzamiento con dos discos compactos.' },
      { nombre: 'Vinilo doble',             descripcion: 'Lanzamiento con dos discos de vinilo.' },
      { nombre: 'Edición libro CD',         descripcion: 'CD incluido en empaque tipo libro.' },
      { nombre: 'Edición libro vinilo',     descripcion: 'Vinilo incluido en empaque tipo libro.' },
      { nombre: 'Formato importado',        descripcion: 'Formato físico importado.' },
      { nombre: 'Formato coleccionista',    descripcion: 'Formato especial para colección.' },
    ],
  });

  // ── 6. Géneros musicales ──────────────────────────────────────────────────
  await prisma.generoMusical.createMany({
    data: [
      { nombre: 'Rock alternativo', descripcion: 'Género derivado del rock con sonidos alternativos.' },
      { nombre: 'Rap',              descripcion: 'Género basado en rimas, ritmo y expresión lírica.' },
      { nombre: 'Rock en español',  descripcion: 'Rock interpretado principalmente en idioma español.' },
      { nombre: 'Reguetón',         descripcion: 'Género urbano latino con base rítmica bailable.' },
      { nombre: 'Pop',              descripcion: 'Música popular orientada a públicos amplios.' },
      { nombre: 'R&B',              descripcion: 'Género con influencias de soul, pop y rhythm and blues.' },
      { nombre: 'Electrónica',      descripcion: 'Música basada en producción digital y sintetizadores.' },
      { nombre: 'Industrial rock',  descripcion: 'Rock con elementos electrónicos e industriales.' },
      { nombre: 'Dance pop',        descripcion: 'Pop con orientación bailable.' },
      { nombre: 'EDM',              descripcion: 'Música electrónica orientada a festivales y clubes.' },
      { nombre: 'Trip hop',         descripcion: 'Género con mezcla de electrónica, hip hop y atmósferas oscuras.' },
      { nombre: 'Funk',             descripcion: 'Género rítmico con fuerte presencia de bajo y groove.' },
      { nombre: 'Soul',             descripcion: 'Género vocal influenciado por gospel y rhythm and blues.' },
      { nombre: 'Ska punk',         descripcion: 'Mezcla de ska, punk y pop rock.' },
      { nombre: 'House',            descripcion: 'Género electrónico bailable de base repetitiva.' },
      { nombre: 'Metal',            descripcion: 'Género pesado con guitarras distorsionadas.' },
      { nombre: 'Hard rock',        descripcion: 'Rock con sonido fuerte y guitarras marcadas.' },
      { nombre: 'Grunge',           descripcion: 'Subgénero del rock alternativo popularizado en los años noventa.' },
      { nombre: 'Hip hop',          descripcion: 'Cultura musical urbana basada en rap y beats.' },
      { nombre: 'Rap clásico',      descripcion: 'Rap de estilo clásico y lírico.' },
      { nombre: 'Pop latino',       descripcion: 'Pop con influencia latina.' },
      { nombre: 'Rock latino',      descripcion: 'Rock interpretado por artistas latinoamericanos.' },
      { nombre: 'Folk latino',      descripcion: 'Música con raíces folclóricas latinoamericanas.' },
      { nombre: 'Synth pop',        descripcion: 'Pop basado en sintetizadores.' },
      { nombre: 'Nu metal',         descripcion: 'Metal con elementos de rap, rock alternativo y electrónica.' },
    ],
  });

  // ── 7. Artistas ───────────────────────────────────────────────────────────
  await prisma.artista.createMany({
    data: [
      { nombre: 'Linkin Park',         paisOrigen: 'Estados Unidos', anioInicio: 1996 },
      { nombre: 'Eminem',              paisOrigen: 'Estados Unidos', anioInicio: 1988 },
      { nombre: 'Héroes del Silencio', paisOrigen: 'España',         anioInicio: 1984 },
      { nombre: 'Wisin y Yandel',      paisOrigen: 'Puerto Rico',    anioInicio: 1998 },
      { nombre: 'Michael Jackson',     paisOrigen: 'Estados Unidos', anioInicio: 1964 },
      { nombre: 'The Neighbourhood',   paisOrigen: 'Estados Unidos', anioInicio: 2011 },
      { nombre: 'Daft Punk',           paisOrigen: 'Francia',        anioInicio: 1993 },
      { nombre: 'Marilyn Manson',      paisOrigen: 'Estados Unidos', anioInicio: 1989 },
      { nombre: 'Lady Gaga',           paisOrigen: 'Estados Unidos', anioInicio: 2005 },
      { nombre: 'Katy Perry',          paisOrigen: 'Estados Unidos', anioInicio: 2001 },
      { nombre: 'David Guetta',        paisOrigen: 'Francia',        anioInicio: 1984 },
      { nombre: 'Gorillaz',            paisOrigen: 'Reino Unido',    anioInicio: 1998 },
      { nombre: 'Madonna',             paisOrigen: 'Estados Unidos', anioInicio: 1979 },
      { nombre: 'Rihanna',             paisOrigen: 'Barbados',       anioInicio: 2003 },
      { nombre: 'Alicia Keys',         paisOrigen: 'Estados Unidos', anioInicio: 1996 },
      { nombre: 'No Doubt',            paisOrigen: 'Estados Unidos', anioInicio: 1986 },
      { nombre: 'Tiësto',              paisOrigen: 'Países Bajos',   anioInicio: 1994 },
      { nombre: 'Metallica',           paisOrigen: 'Estados Unidos', anioInicio: 1981 },
      { nombre: 'Skillet',             paisOrigen: 'Estados Unidos', anioInicio: 1996 },
      { nombre: 'Nirvana',             paisOrigen: 'Estados Unidos', anioInicio: 1987 },
      { nombre: 'Dr. Dre',             paisOrigen: 'Estados Unidos', anioInicio: 1985 },
      { nombre: 'Nas',                 paisOrigen: 'Estados Unidos', anioInicio: 1991 },
      { nombre: 'Juanes',              paisOrigen: 'Colombia',       anioInicio: 1987 },
      { nombre: 'Maná',                paisOrigen: 'México',         anioInicio: 1986 },
      { nombre: 'Natalia Lafourcade',  paisOrigen: 'México',         anioInicio: 1998 },
    ],
  });

  // ── 8. Empleados ─────────────────────────────────────────────────────────
  await prisma.empleado.createMany({
    data: [
      { nombre: 'Vernel',   apellido: 'Hernández', telefono: '4210-1001', correo: 'vernel.hernandez@retrosound.com', fechaContratacion: new Date('2025-01-10') },
      { nombre: 'Ángel',    apellido: 'Sanabria',  telefono: '4210-1002', correo: 'angel.sanabria@retrosound.com',   fechaContratacion: new Date('2025-01-12') },
      { nombre: 'Saul',     apellido: 'Castillo',  telefono: '4210-1003', correo: 'saul.castillo@retrosound.com',    fechaContratacion: new Date('2025-01-15') },
      { nombre: 'Paola',    apellido: 'Hernández', telefono: '4210-1004', correo: 'paola.hernandez@retrosound.com',  fechaContratacion: new Date('2025-02-01') },
      { nombre: 'Carlos',   apellido: 'Mendoza',   telefono: '4210-1005', correo: 'carlos.mendoza@retrosound.com',   fechaContratacion: new Date('2025-02-05') },
      { nombre: 'María',    apellido: 'López',     telefono: '4210-1006', correo: 'maria.lopez@retrosound.com',      fechaContratacion: new Date('2025-02-08') },
      { nombre: 'Luis',     apellido: 'Martínez',  telefono: '4210-1007', correo: 'luis.martinez@retrosound.com',    fechaContratacion: new Date('2025-02-12') },
      { nombre: 'Ana',      apellido: 'Morales',   telefono: '4210-1008', correo: 'ana.morales@retrosound.com',      fechaContratacion: new Date('2025-02-15') },
      { nombre: 'José',     apellido: 'Ramírez',   telefono: '4210-1009', correo: 'jose.ramirez@retrosound.com',     fechaContratacion: new Date('2025-02-20') },
      { nombre: 'Gabriela', apellido: 'Pérez',     telefono: '4210-1010', correo: 'gabriela.perez@retrosound.com',   fechaContratacion: new Date('2025-02-25') },
      { nombre: 'Fernando', apellido: 'Gómez',     telefono: '4210-1011', correo: 'fernando.gomez@retrosound.com',   fechaContratacion: new Date('2025-03-01') },
      { nombre: 'Lucía',    apellido: 'Díaz',      telefono: '4210-1012', correo: 'lucia.diaz@retrosound.com',       fechaContratacion: new Date('2025-03-05') },
      { nombre: 'Ricardo',  apellido: 'Ortiz',     telefono: '4210-1013', correo: 'ricardo.ortiz@retrosound.com',    fechaContratacion: new Date('2025-03-08') },
      { nombre: 'Andrea',   apellido: 'Flores',    telefono: '4210-1014', correo: 'andrea.flores@retrosound.com',    fechaContratacion: new Date('2025-03-12') },
      { nombre: 'Mario',    apellido: 'Reyes',     telefono: '4210-1015', correo: 'mario.reyes@retrosound.com',      fechaContratacion: new Date('2025-03-16') },
      { nombre: 'Sofía',    apellido: 'Navarro',   telefono: '4210-1016', correo: 'sofia.navarro@retrosound.com',    fechaContratacion: new Date('2025-03-20') },
      { nombre: 'Daniel',   apellido: 'Cruz',      telefono: '4210-1017', correo: 'daniel.cruz@retrosound.com',      fechaContratacion: new Date('2025-03-24') },
      { nombre: 'Camila',   apellido: 'Vásquez',   telefono: '4210-1018', correo: 'camila.vasquez@retrosound.com',   fechaContratacion: new Date('2025-04-01') },
      { nombre: 'Javier',   apellido: 'Santos',    telefono: '4210-1019', correo: 'javier.santos@retrosound.com',    fechaContratacion: new Date('2025-04-05') },
      { nombre: 'Natalia',  apellido: 'Aguilar',   telefono: '4210-1020', correo: 'natalia.aguilar@retrosound.com',  fechaContratacion: new Date('2025-04-10') },
      { nombre: 'Héctor',   apellido: 'Molina',    telefono: '4210-1021', correo: 'hector.molina@retrosound.com',    fechaContratacion: new Date('2025-04-15') },
      { nombre: 'Mónica',   apellido: 'Fuentes',   telefono: '4210-1022', correo: 'monica.fuentes@retrosound.com',   fechaContratacion: new Date('2025-04-20') },
      { nombre: 'Samuel',   apellido: 'Castro',    telefono: '4210-1023', correo: 'samuel.castro@retrosound.com',    fechaContratacion: new Date('2025-04-25') },
      { nombre: 'Diana',    apellido: 'Salazar',   telefono: '4210-1024', correo: 'diana.salazar@retrosound.com',    fechaContratacion: new Date('2025-05-01') },
      { nombre: 'Esteban',  apellido: 'Herrera',   telefono: '4210-1025', correo: 'esteban.herrera@retrosound.com',  fechaContratacion: new Date('2025-05-05') },
    ],
  });

  // ── 9. Clientes ───────────────────────────────────────────────────────────
  await prisma.cliente.createMany({
    data: [
      { nombre: 'Andrea',    apellido: 'García',    telefono: '5551-1001', correo: 'andrea.garcia@email.com',    direccion: 'Zona 1, Ciudad de Guatemala',  fechaRegistro: new Date('2026-01-05') },
      { nombre: 'Mario',     apellido: 'López',     telefono: '5551-1002', correo: 'mario.lopez@email.com',      direccion: 'Zona 2, Ciudad de Guatemala',  fechaRegistro: new Date('2026-01-06') },
      { nombre: 'Sofía',     apellido: 'Ramírez',   telefono: '5551-1003', correo: 'sofia.ramirez@email.com',    direccion: 'Zona 3, Ciudad de Guatemala',  fechaRegistro: new Date('2026-01-07') },
      { nombre: 'Daniel',    apellido: 'Castro',    telefono: '5551-1004', correo: 'daniel.castro@email.com',    direccion: 'Zona 4, Ciudad de Guatemala',  fechaRegistro: new Date('2026-01-08') },
      { nombre: 'Valeria',   apellido: 'Pérez',     telefono: '5551-1005', correo: 'valeria.perez@email.com',    direccion: 'Zona 5, Ciudad de Guatemala',  fechaRegistro: new Date('2026-01-09') },
      { nombre: 'Luis',      apellido: 'Morales',   telefono: '5551-1006', correo: 'luis.morales@email.com',     direccion: 'Zona 6, Mixco',               fechaRegistro: new Date('2026-01-10') },
      { nombre: 'Camila',    apellido: 'Herrera',   telefono: '5551-1007', correo: 'camila.herrera@email.com',   direccion: 'Zona 7, Mixco',               fechaRegistro: new Date('2026-01-11') },
      { nombre: 'José',      apellido: 'Méndez',    telefono: '5551-1008', correo: 'jose.mendez@email.com',      direccion: 'Zona 8, Villa Nueva',         fechaRegistro: new Date('2026-01-12') },
      { nombre: 'Fernanda',  apellido: 'Ortiz',     telefono: '5551-1009', correo: 'fernanda.ortiz@email.com',   direccion: 'Zona 9, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-13') },
      { nombre: 'Carlos',    apellido: 'Ruiz',      telefono: '5551-1010', correo: 'carlos.ruiz@email.com',      direccion: 'Zona 10, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-14') },
      { nombre: 'Paola',     apellido: 'Vásquez',   telefono: '5551-1011', correo: 'paola.vasquez@email.com',    direccion: 'Zona 11, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-15') },
      { nombre: 'Javier',    apellido: 'Flores',    telefono: '5551-1012', correo: 'javier.flores@email.com',    direccion: 'Zona 12, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-16') },
      { nombre: 'Gabriela',  apellido: 'Santos',    telefono: '5551-1013', correo: 'gabriela.santos@email.com',  direccion: 'Zona 13, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-17') },
      { nombre: 'Ricardo',   apellido: 'Reyes',     telefono: '5551-1014', correo: 'ricardo.reyes@email.com',    direccion: 'Zona 14, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-18') },
      { nombre: 'María',     apellido: 'Cruz',      telefono: '5551-1015', correo: 'maria.cruz@email.com',       direccion: 'Zona 15, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-19') },
      { nombre: 'Kevin',     apellido: 'Aguilar',   telefono: '5551-1016', correo: 'kevin.aguilar@email.com',    direccion: 'Zona 16, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-20') },
      { nombre: 'Lucía',     apellido: 'Molina',    telefono: '5551-1017', correo: 'lucia.molina@email.com',     direccion: 'Zona 17, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-21') },
      { nombre: 'Diego',     apellido: 'Navarro',   telefono: '5551-1018', correo: 'diego.navarro@email.com',    direccion: 'Zona 18, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-22') },
      { nombre: 'Alejandra', apellido: 'Ramos',     telefono: '5551-1019', correo: 'alejandra.ramos@email.com',  direccion: 'Antigua Guatemala',           fechaRegistro: new Date('2026-01-23') },
      { nombre: 'Sebastián', apellido: 'Gómez',     telefono: '5551-1020', correo: 'sebastian.gomez@email.com',  direccion: 'San Lucas Sacatepéquez',      fechaRegistro: new Date('2026-01-24') },
      { nombre: 'Natalia',   apellido: 'Chávez',    telefono: '5551-1021', correo: 'natalia.chavez@email.com',   direccion: 'Santa Catarina Pinula',       fechaRegistro: new Date('2026-01-25') },
      { nombre: 'Héctor',    apellido: 'Fuentes',   telefono: '5551-1022', correo: 'hector.fuentes@email.com',   direccion: 'Fraijanes',                   fechaRegistro: new Date('2026-01-26') },
      { nombre: 'Mónica',    apellido: 'Salazar',   telefono: '5551-1023', correo: 'monica.salazar@email.com',   direccion: 'Carretera a El Salvador',     fechaRegistro: new Date('2026-01-27') },
      { nombre: 'Samuel',    apellido: 'Robledo',   telefono: '5551-1024', correo: 'samuel.robledo@email.com',   direccion: 'Zona 21, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-28') },
      { nombre: 'Derek',     apellido: 'Hernández', telefono: '5551-1025', correo: 'derek.hernandez@email.com',  direccion: 'Zona 11, Ciudad de Guatemala', fechaRegistro: new Date('2026-01-29') },
    ],
  });

  // ── 10. Proveedores ───────────────────────────────────────────────────────
  await prisma.proveedor.createMany({
    data: [
      { nombre: 'Distribuidora Musical Guatemala', telefono: '2300-1001', correo: 'ventas@dmg.com.gt',           direccion: 'Zona 4, Ciudad de Guatemala',  nombreContacto: 'Carlos Méndez'    },
      { nombre: 'Vinyl Import Central',            telefono: '2300-1002', correo: 'contacto@vinylimport.com',    direccion: 'Zona 10, Ciudad de Guatemala', nombreContacto: 'Ana Morales'      },
      { nombre: 'Retro Music Supply',              telefono: '2300-1003', correo: 'pedidos@retromusic.com',      direccion: 'Zona 1, Ciudad de Guatemala',  nombreContacto: 'Luis Herrera'     },
      { nombre: 'AudioMarket GT',                  telefono: '2300-1004', correo: 'ventas@audiomarketgt.com',    direccion: 'Mixco, Guatemala',             nombreContacto: 'María López'      },
      { nombre: 'Classic Records',                 telefono: '2300-1005', correo: 'info@classicrecords.com',     direccion: 'Antigua Guatemala',            nombreContacto: 'José Castillo'    },
      { nombre: 'Global Music Imports',            telefono: '2300-1006', correo: 'sales@globalmusic.com',       direccion: 'Zona 13, Ciudad de Guatemala', nombreContacto: 'Fernanda Ortiz'   },
      { nombre: 'Sonido Pro S.A.',                 telefono: '2300-1007', correo: 'contacto@sonidopro.com.gt',   direccion: 'Zona 9, Ciudad de Guatemala',  nombreContacto: 'Daniel Ruiz'      },
      { nombre: 'CD Warehouse GT',                 telefono: '2300-1008', correo: 'ventas@cdwarehouse.gt',       direccion: 'Villa Nueva, Guatemala',       nombreContacto: 'Paola Reyes'      },
      { nombre: 'Cassette Revival',                telefono: '2300-1009', correo: 'orders@cassetterevival.com',  direccion: 'Zona 11, Ciudad de Guatemala', nombreContacto: 'Ricardo Gómez'    },
      { nombre: 'Music Collector Hub',             telefono: '2300-1010', correo: 'info@collectorhub.com',       direccion: 'Zona 15, Ciudad de Guatemala', nombreContacto: 'Gabriela Pérez'   },
      { nombre: 'Importadora Melodía',             telefono: '2300-1011', correo: 'ventas@melodia.gt',           direccion: 'Zona 7, Mixco',                nombreContacto: 'Mario Santos'     },
      { nombre: 'RockStock Distribución',          telefono: '2300-1012', correo: 'contacto@rockstock.com',      direccion: 'Zona 12, Ciudad de Guatemala', nombreContacto: 'Lucía Flores'     },
      { nombre: 'Pop Records Supply',              telefono: '2300-1013', correo: 'ventas@poprecords.com',       direccion: 'Zona 14, Ciudad de Guatemala', nombreContacto: 'Javier Navarro'   },
      { nombre: 'Latino Music Center',             telefono: '2300-1014', correo: 'pedidos@latinomusic.com',     direccion: 'Zona 5, Ciudad de Guatemala',  nombreContacto: 'Camila Cruz'      },
      { nombre: 'Electronic Beats Imports',        telefono: '2300-1015', correo: 'sales@electrobeats.com',      direccion: 'Zona 16, Ciudad de Guatemala', nombreContacto: 'Héctor Molina'    },
      { nombre: 'Urban Music Supply',              telefono: '2300-1016', correo: 'ventas@urbanmusic.com',       direccion: 'Zona 18, Ciudad de Guatemala', nombreContacto: 'Mónica Fuentes'   },
      { nombre: 'Colecciones Musicales GT',        telefono: '2300-1017', correo: 'info@coleccionesgt.com',      direccion: 'Fraijanes, Guatemala',         nombreContacto: 'Natalia Chávez'   },
      { nombre: 'Vinilo Selecto',                  telefono: '2300-1018', correo: 'contacto@viniloselecto.gt',   direccion: 'San Lucas Sacatepéquez',       nombreContacto: 'Esteban Herrera'  },
      { nombre: 'Mundo CD',                        telefono: '2300-1019', correo: 'ventas@mundocd.gt',           direccion: 'Zona 3, Ciudad de Guatemala',  nombreContacto: 'Diana Salazar'    },
      { nombre: 'Casetes y Más',                   telefono: '2300-1020', correo: 'info@casetesymas.gt',         direccion: 'Zona 2, Ciudad de Guatemala',  nombreContacto: 'Samuel Castro'    },
      { nombre: 'Music Box International',         telefono: '2300-1021', correo: 'sales@musicbox.com',          direccion: 'Zona 6, Ciudad de Guatemala',  nombreContacto: 'Andrea García'    },
      { nombre: 'Record Store Partners',           telefono: '2300-1022', correo: 'partners@recordstore.com',    direccion: 'Zona 8, Ciudad de Guatemala',  nombreContacto: 'Diego Ramírez'    },
      { nombre: 'Ediciones Deluxe GT',             telefono: '2300-1023', correo: 'ventas@deluxegt.com',         direccion: 'Zona 17, Ciudad de Guatemala', nombreContacto: 'Sofía Morales'    },
      { nombre: 'Discos del Centro',               telefono: '2300-1024', correo: 'contacto@discoscentro.gt',    direccion: 'Zona 1, Ciudad de Guatemala',  nombreContacto: 'Kevin Aguilar'    },
      { nombre: 'Importaciones RetroSound',        telefono: '2300-1025', correo: 'import@retrosound.com',       direccion: 'Zona 10, Ciudad de Guatemala', nombreContacto: 'Valeria Pérez'    },
    ],
  });

  // ── 11. Productos ─────────────────────────────────────────────────────────
  // idCategoria: 1=ÁlbumEstudio 4=Reedición 6=Deluxe 9=ViniloClásico 10=CDEstándar
  //              13=Remasterización 16=Nacional 17=ColecciónEsencial 23=EdiciónRemixes
  // idFormato:   1=Vinilo12" 3=CDJewel 4=CDDigipack 5=CaseteEstándar
  //              8=BoxSetVinilo 10=ViniloNegro 21=ViniloDoble
  await prisma.producto.createMany({
    data: [
      { titulo: 'Hybrid Theory',              descripcion: 'Álbum físico de Linkin Park en edición de colección.',          anioLanzamiento: 2000, precioVenta: 249.99, stockActual: 18, stockMinimo: 5, codigoSku: 'RS-LP-HT-001',   idCategoria: 1,  idFormato: 1  },
      { titulo: 'The Marshall Mathers LP',    descripcion: 'Álbum físico de Eminem en edición estándar.',                   anioLanzamiento: 2000, precioVenta: 219.99, stockActual: 14, stockMinimo: 4, codigoSku: 'RS-EM-MMLP-002', idCategoria: 1,  idFormato: 3  },
      { titulo: 'Senderos de Traición',       descripcion: 'Álbum clásico de Héroes del Silencio en formato físico.',       anioLanzamiento: 1990, precioVenta: 199.99, stockActual: 11, stockMinimo: 3, codigoSku: 'RS-HS-SDT-003',  idCategoria: 4,  idFormato: 4  },
      { titulo: "Pa'l Mundo",                 descripcion: 'Álbum físico de Wisin y Yandel con éxitos urbanos.',            anioLanzamiento: 2005, precioVenta: 189.99, stockActual: 20, stockMinimo: 5, codigoSku: 'RS-WY-PM-004',   idCategoria: 1,  idFormato: 3  },
      { titulo: 'Thriller',                   descripcion: 'Álbum icónico de Michael Jackson en edición física.',           anioLanzamiento: 1982, precioVenta: 299.99, stockActual: 25, stockMinimo: 6, codigoSku: 'RS-MJ-TH-005',   idCategoria: 13, idFormato: 8  },
      { titulo: 'I Love You.',                descripcion: 'Álbum de The Neighbourhood en edición física.',                 anioLanzamiento: 2013, precioVenta: 209.99, stockActual: 12, stockMinimo: 4, codigoSku: 'RS-TN-ILY-006',  idCategoria: 1,  idFormato: 10 },
      { titulo: 'Random Access Memories',     descripcion: 'Álbum de Daft Punk en edición física de colección.',            anioLanzamiento: 2013, precioVenta: 279.99, stockActual: 16, stockMinimo: 5, codigoSku: 'RS-DP-RAM-007',  idCategoria: 3,  idFormato: 21 },
      { titulo: 'Antichrist Superstar',       descripcion: 'Álbum de Marilyn Manson en formato físico.',                   anioLanzamiento: 1996, precioVenta: 229.99, stockActual:  9, stockMinimo: 3, codigoSku: 'RS-MM-AS-008',   idCategoria: 1,  idFormato: 5  },
      { titulo: 'The Fame',                   descripcion: 'Álbum debut de Lady Gaga en edición CD.',                       anioLanzamiento: 2008, precioVenta: 189.99, stockActual: 17, stockMinimo: 5, codigoSku: 'RS-LG-TF-009',   idCategoria: 10, idFormato: 3  },
      { titulo: 'Teenage Dream',              descripcion: 'Álbum pop de Katy Perry en edición física.',                    anioLanzamiento: 2010, precioVenta: 199.99, stockActual: 15, stockMinimo: 4, codigoSku: 'RS-KP-TD-010',   idCategoria: 6,  idFormato: 4  },
      { titulo: 'Nothing but the Beat',       descripcion: 'Álbum de David Guetta con enfoque electrónico.',               anioLanzamiento: 2011, precioVenta: 209.99, stockActual: 18, stockMinimo: 5, codigoSku: 'RS-DG-NBTB-011', idCategoria: 23, idFormato: 3  },
      { titulo: 'Demon Days',                 descripcion: 'Álbum físico de Gorillaz en edición estándar.',                 anioLanzamiento: 2005, precioVenta: 229.99, stockActual: 13, stockMinimo: 4, codigoSku: 'RS-GZ-DD-012',   idCategoria: 1,  idFormato: 1  },
      { titulo: 'Like a Virgin',              descripcion: 'Álbum clásico de Madonna en edición física.',                   anioLanzamiento: 1984, precioVenta: 199.99, stockActual: 10, stockMinimo: 3, codigoSku: 'RS-MD-LAV-013',  idCategoria: 9,  idFormato: 10 },
      { titulo: 'Good Girl Gone Bad',         descripcion: 'Álbum físico de Rihanna en edición CD.',                        anioLanzamiento: 2007, precioVenta: 189.99, stockActual: 16, stockMinimo: 4, codigoSku: 'RS-RH-GGGB-014', idCategoria: 10, idFormato: 3  },
      { titulo: 'Songs in A Minor',           descripcion: 'Álbum de Alicia Keys en formato físico.',                       anioLanzamiento: 2001, precioVenta: 199.99, stockActual: 14, stockMinimo: 4, codigoSku: 'RS-AK-SIAM-015', idCategoria: 1,  idFormato: 4  },
      { titulo: 'Tragic Kingdom',             descripcion: 'Álbum de No Doubt en edición física.',                          anioLanzamiento: 1995, precioVenta: 219.99, stockActual:  8, stockMinimo: 3, codigoSku: 'RS-ND-TK-016',   idCategoria: 4,  idFormato: 5  },
      { titulo: 'Elements of Life',           descripcion: 'Álbum de Tiësto en formato físico.',                            anioLanzamiento: 2007, precioVenta: 209.99, stockActual: 15, stockMinimo: 4, codigoSku: 'RS-TS-EOL-017',  idCategoria: 23, idFormato: 3  },
      { titulo: 'Master of Puppets',          descripcion: 'Álbum de Metallica en edición física.',                         anioLanzamiento: 1986, precioVenta: 259.99, stockActual: 12, stockMinimo: 4, codigoSku: 'RS-MT-MOP-018',  idCategoria: 13, idFormato: 1  },
      { titulo: 'Comatose',                   descripcion: 'Álbum de Skillet en edición CD.',                               anioLanzamiento: 2006, precioVenta: 189.99, stockActual: 11, stockMinimo: 3, codigoSku: 'RS-SK-COM-019',  idCategoria: 1,  idFormato: 3  },
      { titulo: 'Nevermind',                  descripcion: 'Álbum de Nirvana en edición física.',                           anioLanzamiento: 1991, precioVenta: 249.99, stockActual: 19, stockMinimo: 5, codigoSku: 'RS-NV-NM-020',   idCategoria: 13, idFormato: 8  },
      { titulo: 'The Chronic',                descripcion: 'Álbum clásico de Dr. Dre en formato físico.',                   anioLanzamiento: 1992, precioVenta: 229.99, stockActual: 10, stockMinimo: 3, codigoSku: 'RS-DD-TC-021',   idCategoria: 17, idFormato: 3  },
      { titulo: 'Illmatic',                   descripcion: 'Álbum de Nas en edición física.',                               anioLanzamiento: 1994, precioVenta: 219.99, stockActual:  9, stockMinimo: 3, codigoSku: 'RS-NS-ILL-022',  idCategoria: 17, idFormato: 4  },
      { titulo: 'Un Día Normal',              descripcion: 'Álbum de Juanes en edición física.',                            anioLanzamiento: 2002, precioVenta: 189.99, stockActual: 14, stockMinimo: 4, codigoSku: 'RS-JN-UDN-023',  idCategoria: 16, idFormato: 3  },
      { titulo: '¿Dónde Jugarán los Niños?', descripcion: 'Álbum clásico de Maná en formato físico.',                      anioLanzamiento: 1992, precioVenta: 209.99, stockActual: 13, stockMinimo: 4, codigoSku: 'RS-MA-DJLN-024', idCategoria: 4,  idFormato: 5  },
      { titulo: 'Hasta la Raíz',              descripcion: 'Álbum de Natalia Lafourcade en edición física.',                anioLanzamiento: 2015, precioVenta: 199.99, stockActual: 15, stockMinimo: 4, codigoSku: 'RS-NL-HLR-025',  idCategoria: 6,  idFormato: 4  },
    ],
  });

  // ── 12. Producto–Artista (1:1 por posición) ───────────────────────────────
  await prisma.productoArtista.createMany({
    data: Array.from({ length: 25 }, (_, i) => ({ idProducto: i + 1, idArtista: i + 1 })),
  });

  // ── 13. Producto–Género ───────────────────────────────────────────────────
  // Índice = idProducto-1, valor = idGeneroMusical
  const generosPorProducto = [25,2,3,4,5,1,7,8,9,5,10,11,5,6,13,14,15,16,17,18,19,20,21,22,23];
  await prisma.productoGenero.createMany({
    data: generosPorProducto.map((idGeneroMusical, i) => ({
      idProducto: i + 1,
      idGeneroMusical,
    })),
  });

  // ── 14. Usuarios ──────────────────────────────────────────────────────────
  // Contraseña única para todos los usuarios demo: retro2025
  await prisma.usuario.createMany({
    data: [
      // admin → empleado 1 (Vernel)
      { correo: 'admin@retrosound.com',              contrasenaHash: demoHash, rol: 'admin',     idEmpleado: 1  },
      // 9 empleados con cuenta
      { correo: 'angel.sanabria@retrosound.com',     contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 2  },
      { correo: 'saul.castillo@retrosound.com',      contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 3  },
      { correo: 'paola.hernandez@retrosound.com',    contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 4  },
      { correo: 'carlos.mendoza@retrosound.com',     contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 5  },
      { correo: 'maria.lopez@retrosound.com',        contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 6  },
      { correo: 'luis.martinez@retrosound.com',      contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 7  },
      { correo: 'ana.morales@retrosound.com',        contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 8  },
      { correo: 'jose.ramirez@retrosound.com',       contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 9  },
      { correo: 'gabriela.perez@retrosound.com',     contrasenaHash: demoHash, rol: 'empleado',  idEmpleado: 10 },
      // 13 clientes con cuenta
      { correo: 'andrea.garcia@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 1   },
      { correo: 'mario.lopez@email.com',             contrasenaHash: demoHash, rol: 'cliente',   idCliente: 2   },
      { correo: 'sofia.ramirez@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 3   },
      { correo: 'daniel.castro@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 4   },
      { correo: 'valeria.perez@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 5   },
      { correo: 'luis.morales@email.com',            contrasenaHash: demoHash, rol: 'cliente',   idCliente: 6   },
      { correo: 'camila.herrera@email.com',          contrasenaHash: demoHash, rol: 'cliente',   idCliente: 7   },
      { correo: 'jose.mendez@email.com',             contrasenaHash: demoHash, rol: 'cliente',   idCliente: 8   },
      { correo: 'fernanda.ortiz@email.com',          contrasenaHash: demoHash, rol: 'cliente',   idCliente: 9   },
      { correo: 'carlos.ruiz@email.com',             contrasenaHash: demoHash, rol: 'cliente',   idCliente: 10  },
      { correo: 'paola.vasquez@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 11  },
      { correo: 'javier.flores@email.com',           contrasenaHash: demoHash, rol: 'cliente',   idCliente: 12  },
      { correo: 'gabriela.santos@email.com',         contrasenaHash: demoHash, rol: 'cliente',   idCliente: 13  },
      // 2 proveedores con cuenta
      { correo: 'proveedor1@retrosound.com',         contrasenaHash: demoHash, rol: 'proveedor', idProveedor: 1 },
      { correo: 'proveedor2@retrosound.com',         contrasenaHash: demoHash, rol: 'proveedor', idProveedor: 2 },
    ],
  });

  // ── 15. Ventas ────────────────────────────────────────────────────────────
  await prisma.venta.createMany({
    data: [
      { fechaVenta: new Date('2026-04-01'), descuento:  0, metodoPago: 'efectivo',      estado: 'completada', idCliente:  1, idEmpleado:  1 },
      { fechaVenta: new Date('2026-04-01'), descuento: 10, metodoPago: 'tarjeta',        estado: 'completada', idCliente:  2, idEmpleado:  2 },
      { fechaVenta: new Date('2026-04-02'), descuento:  0, metodoPago: 'transferencia',  estado: 'completada', idCliente:  3, idEmpleado:  3 },
      { fechaVenta: new Date('2026-04-02'), descuento:  5, metodoPago: 'efectivo',       estado: 'completada', idCliente:  4, idEmpleado:  4 },
      { fechaVenta: new Date('2026-04-03'), descuento:  0, metodoPago: 'tarjeta',        estado: 'completada', idCliente:  5, idEmpleado:  5 },
      { fechaVenta: new Date('2026-04-03'), descuento: 15, metodoPago: 'transferencia',  estado: 'completada', idCliente:  6, idEmpleado:  6 },
      { fechaVenta: new Date('2026-04-04'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente:  7, idEmpleado:  7 },
      { fechaVenta: new Date('2026-04-04'), descuento:  0, metodoPago: 'tarjeta',        estado: 'pendiente',  idCliente:  8, idEmpleado:  8 },
      { fechaVenta: new Date('2026-04-05'), descuento: 20, metodoPago: 'transferencia',  estado: 'completada', idCliente:  9, idEmpleado:  9 },
      { fechaVenta: new Date('2026-04-05'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente: 10, idEmpleado: 10 },
      { fechaVenta: new Date('2026-04-06'), descuento:  0, metodoPago: 'tarjeta',        estado: 'completada', idCliente: 11, idEmpleado: 11 },
      { fechaVenta: new Date('2026-04-06'), descuento: 10, metodoPago: 'transferencia',  estado: 'completada', idCliente: 12, idEmpleado: 12 },
      { fechaVenta: new Date('2026-04-07'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente: 13, idEmpleado: 13 },
      { fechaVenta: new Date('2026-04-07'), descuento:  0, metodoPago: 'tarjeta',        estado: 'cancelada',  idCliente: 14, idEmpleado: 14 },
      { fechaVenta: new Date('2026-04-08'), descuento:  5, metodoPago: 'transferencia',  estado: 'completada', idCliente: 15, idEmpleado: 15 },
      { fechaVenta: new Date('2026-04-08'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente: 16, idEmpleado: 16 },
      { fechaVenta: new Date('2026-04-09'), descuento:  0, metodoPago: 'tarjeta',        estado: 'completada', idCliente: 17, idEmpleado: 17 },
      { fechaVenta: new Date('2026-04-09'), descuento: 10, metodoPago: 'transferencia',  estado: 'completada', idCliente: 18, idEmpleado: 18 },
      { fechaVenta: new Date('2026-04-10'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente: 19, idEmpleado: 19 },
      { fechaVenta: new Date('2026-04-10'), descuento:  0, metodoPago: 'tarjeta',        estado: 'completada', idCliente: 20, idEmpleado: 20 },
      { fechaVenta: new Date('2026-04-11'), descuento:  5, metodoPago: 'transferencia',  estado: 'completada', idCliente: 21, idEmpleado: 21 },
      { fechaVenta: new Date('2026-04-11'), descuento:  0, metodoPago: 'efectivo',       estado: 'pendiente',  idCliente: 22, idEmpleado: 22 },
      { fechaVenta: new Date('2026-04-12'), descuento:  0, metodoPago: 'tarjeta',        estado: 'completada', idCliente: 23, idEmpleado: 23 },
      { fechaVenta: new Date('2026-04-12'), descuento: 15, metodoPago: 'transferencia',  estado: 'completada', idCliente: 24, idEmpleado: 24 },
      { fechaVenta: new Date('2026-04-13'), descuento:  0, metodoPago: 'efectivo',       estado: 'completada', idCliente: 25, idEmpleado: 25 },
    ],
  });

  // ── 16. Detalles de venta ─────────────────────────────────────────────────
  await prisma.detalleVenta.createMany({
    data: [
      { idVenta:  1, idProducto:  1, cantidadVendida: 1, precioUnitario: 249.99, descuentoDetalle:  0 },
      { idVenta:  2, idProducto:  2, cantidadVendida: 1, precioUnitario: 219.99, descuentoDetalle:  5 },
      { idVenta:  3, idProducto:  3, cantidadVendida: 1, precioUnitario: 199.99, descuentoDetalle:  0 },
      { idVenta:  4, idProducto:  4, cantidadVendida: 2, precioUnitario: 189.99, descuentoDetalle: 10 },
      { idVenta:  5, idProducto:  5, cantidadVendida: 1, precioUnitario: 299.99, descuentoDetalle:  0 },
      { idVenta:  6, idProducto:  6, cantidadVendida: 1, precioUnitario: 209.99, descuentoDetalle:  5 },
      { idVenta:  7, idProducto:  7, cantidadVendida: 1, precioUnitario: 279.99, descuentoDetalle:  0 },
      { idVenta:  8, idProducto:  8, cantidadVendida: 1, precioUnitario: 229.99, descuentoDetalle:  0 },
      { idVenta:  9, idProducto:  9, cantidadVendida: 2, precioUnitario: 189.99, descuentoDetalle: 15 },
      { idVenta: 10, idProducto: 10, cantidadVendida: 1, precioUnitario: 199.99, descuentoDetalle:  0 },
      { idVenta: 11, idProducto: 11, cantidadVendida: 1, precioUnitario: 209.99, descuentoDetalle:  0 },
      { idVenta: 12, idProducto: 12, cantidadVendida: 1, precioUnitario: 229.99, descuentoDetalle:  5 },
      { idVenta: 13, idProducto: 13, cantidadVendida: 1, precioUnitario: 199.99, descuentoDetalle:  0 },
      { idVenta: 14, idProducto: 14, cantidadVendida: 1, precioUnitario: 189.99, descuentoDetalle:  0 },
      { idVenta: 15, idProducto: 15, cantidadVendida: 2, precioUnitario: 199.99, descuentoDetalle: 10 },
      { idVenta: 16, idProducto: 16, cantidadVendida: 1, precioUnitario: 219.99, descuentoDetalle:  0 },
      { idVenta: 17, idProducto: 17, cantidadVendida: 1, precioUnitario: 209.99, descuentoDetalle:  0 },
      { idVenta: 18, idProducto: 18, cantidadVendida: 1, precioUnitario: 259.99, descuentoDetalle:  5 },
      { idVenta: 19, idProducto: 19, cantidadVendida: 1, precioUnitario: 189.99, descuentoDetalle:  0 },
      { idVenta: 20, idProducto: 20, cantidadVendida: 1, precioUnitario: 249.99, descuentoDetalle:  0 },
      { idVenta: 21, idProducto: 21, cantidadVendida: 1, precioUnitario: 229.99, descuentoDetalle:  5 },
      { idVenta: 22, idProducto: 22, cantidadVendida: 1, precioUnitario: 219.99, descuentoDetalle:  0 },
      { idVenta: 23, idProducto: 23, cantidadVendida: 2, precioUnitario: 189.99, descuentoDetalle: 10 },
      { idVenta: 24, idProducto: 24, cantidadVendida: 1, precioUnitario: 209.99, descuentoDetalle:  5 },
      { idVenta: 25, idProducto: 25, cantidadVendida: 1, precioUnitario: 199.99, descuentoDetalle:  0 },
    ],
  });

  // ── 17. Compras a proveedor ───────────────────────────────────────────────
  await prisma.compraProveedor.createMany({
    data: [
      { fechaCompra: new Date('2026-03-01'), estado: 'recibida',  idProveedor:  1, idEmpleado:  1 },
      { fechaCompra: new Date('2026-03-01'), estado: 'recibida',  idProveedor:  2, idEmpleado:  2 },
      { fechaCompra: new Date('2026-03-02'), estado: 'recibida',  idProveedor:  3, idEmpleado:  3 },
      { fechaCompra: new Date('2026-03-02'), estado: 'recibida',  idProveedor:  4, idEmpleado:  4 },
      { fechaCompra: new Date('2026-03-03'), estado: 'recibida',  idProveedor:  5, idEmpleado:  5 },
      { fechaCompra: new Date('2026-03-03'), estado: 'recibida',  idProveedor:  6, idEmpleado:  6 },
      { fechaCompra: new Date('2026-03-04'), estado: 'recibida',  idProveedor:  7, idEmpleado:  7 },
      { fechaCompra: new Date('2026-03-04'), estado: 'pendiente', idProveedor:  8, idEmpleado:  8 },
      { fechaCompra: new Date('2026-03-05'), estado: 'recibida',  idProveedor:  9, idEmpleado:  9 },
      { fechaCompra: new Date('2026-03-05'), estado: 'recibida',  idProveedor: 10, idEmpleado: 10 },
      { fechaCompra: new Date('2026-03-06'), estado: 'recibida',  idProveedor: 11, idEmpleado: 11 },
      { fechaCompra: new Date('2026-03-06'), estado: 'cancelada', idProveedor: 12, idEmpleado: 12 },
      { fechaCompra: new Date('2026-03-07'), estado: 'recibida',  idProveedor: 13, idEmpleado: 13 },
      { fechaCompra: new Date('2026-03-07'), estado: 'recibida',  idProveedor: 14, idEmpleado: 14 },
      { fechaCompra: new Date('2026-03-08'), estado: 'recibida',  idProveedor: 15, idEmpleado: 15 },
      { fechaCompra: new Date('2026-03-08'), estado: 'pendiente', idProveedor: 16, idEmpleado: 16 },
      { fechaCompra: new Date('2026-03-09'), estado: 'recibida',  idProveedor: 17, idEmpleado: 17 },
      { fechaCompra: new Date('2026-03-09'), estado: 'recibida',  idProveedor: 18, idEmpleado: 18 },
      { fechaCompra: new Date('2026-03-10'), estado: 'recibida',  idProveedor: 19, idEmpleado: 19 },
      { fechaCompra: new Date('2026-03-10'), estado: 'recibida',  idProveedor: 20, idEmpleado: 20 },
      { fechaCompra: new Date('2026-03-11'), estado: 'recibida',  idProveedor: 21, idEmpleado: 21 },
      { fechaCompra: new Date('2026-03-11'), estado: 'recibida',  idProveedor: 22, idEmpleado: 22 },
      { fechaCompra: new Date('2026-03-12'), estado: 'recibida',  idProveedor: 23, idEmpleado: 23 },
      { fechaCompra: new Date('2026-03-12'), estado: 'recibida',  idProveedor: 24, idEmpleado: 24 },
      { fechaCompra: new Date('2026-03-13'), estado: 'recibida',  idProveedor: 25, idEmpleado: 25 },
    ],
  });

  // ── 18. Detalles de compra ────────────────────────────────────────────────
  await prisma.detalleCompraProveedor.createMany({
    data: [
      { idCompraProveedor:  1, idProducto:  1, cantidadComprada: 20, costoUnitarioCompra: 145 },
      { idCompraProveedor:  2, idProducto:  2, cantidadComprada: 18, costoUnitarioCompra: 130 },
      { idCompraProveedor:  3, idProducto:  3, cantidadComprada: 15, costoUnitarioCompra: 115 },
      { idCompraProveedor:  4, idProducto:  4, cantidadComprada: 25, costoUnitarioCompra: 105 },
      { idCompraProveedor:  5, idProducto:  5, cantidadComprada: 30, costoUnitarioCompra: 180 },
      { idCompraProveedor:  6, idProducto:  6, cantidadComprada: 16, costoUnitarioCompra: 120 },
      { idCompraProveedor:  7, idProducto:  7, cantidadComprada: 22, costoUnitarioCompra: 165 },
      { idCompraProveedor:  8, idProducto:  8, cantidadComprada: 12, costoUnitarioCompra: 135 },
      { idCompraProveedor:  9, idProducto:  9, cantidadComprada: 20, costoUnitarioCompra: 100 },
      { idCompraProveedor: 10, idProducto: 10, cantidadComprada: 18, costoUnitarioCompra: 110 },
      { idCompraProveedor: 11, idProducto: 11, cantidadComprada: 24, costoUnitarioCompra: 125 },
      { idCompraProveedor: 12, idProducto: 12, cantidadComprada: 14, costoUnitarioCompra: 140 },
      { idCompraProveedor: 13, idProducto: 13, cantidadComprada: 15, costoUnitarioCompra: 115 },
      { idCompraProveedor: 14, idProducto: 14, cantidadComprada: 20, costoUnitarioCompra: 105 },
      { idCompraProveedor: 15, idProducto: 15, cantidadComprada: 18, costoUnitarioCompra: 110 },
      { idCompraProveedor: 16, idProducto: 16, cantidadComprada: 12, costoUnitarioCompra: 125 },
      { idCompraProveedor: 17, idProducto: 17, cantidadComprada: 20, costoUnitarioCompra: 120 },
      { idCompraProveedor: 18, idProducto: 18, cantidadComprada: 16, costoUnitarioCompra: 150 },
      { idCompraProveedor: 19, idProducto: 19, cantidadComprada: 14, costoUnitarioCompra: 105 },
      { idCompraProveedor: 20, idProducto: 20, cantidadComprada: 25, costoUnitarioCompra: 145 },
      { idCompraProveedor: 21, idProducto: 21, cantidadComprada: 15, costoUnitarioCompra: 130 },
      { idCompraProveedor: 22, idProducto: 22, cantidadComprada: 12, costoUnitarioCompra: 125 },
      { idCompraProveedor: 23, idProducto: 23, cantidadComprada: 20, costoUnitarioCompra: 105 },
      { idCompraProveedor: 24, idProducto: 24, cantidadComprada: 18, costoUnitarioCompra: 115 },
      { idCompraProveedor: 25, idProducto: 25, cantidadComprada: 20, costoUnitarioCompra: 110 },
    ],
  });

  console.log('✓ Seed completado:');
  console.log('  25 categorías · 25 formatos · 25 géneros · 25 artistas');
  console.log('  25 productos · 25 clientes · 25 empleados · 25 proveedores');
  console.log('  25 usuarios · 25 ventas · 25 compras (con sus detalles)');
  console.log('  Contraseña demo para todos: retro2025');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

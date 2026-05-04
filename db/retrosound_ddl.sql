-- =============================================================================
-- RetroSound Store
-- Base de Datos 1 - Proyecto 2
-- DDL oficial PostgreSQL 17
-- =============================================================================

-- ── Limpieza para ejecución desde cero ───────────────────────────────────────

DROP VIEW IF EXISTS vista_resumen_ventas;

DROP TABLE IF EXISTS carrito_item CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS detalle_compra_proveedor CASCADE;
DROP TABLE IF EXISTS compra_proveedor CASCADE;
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS venta CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS producto_genero CASCADE;
DROP TABLE IF EXISTS producto_artista CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS artista CASCADE;
DROP TABLE IF EXISTS genero_musical CASCADE;
DROP TABLE IF EXISTS formato CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;

-- ── Catálogos ────────────────────────────────────────────────────────────────

CREATE TABLE categoria (
    id_categoria          SERIAL       NOT NULL,
    nombre_categoria      VARCHAR(255) NOT NULL,
    descripcion_categoria VARCHAR(255),
    estado_categoria      VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria),
    CONSTRAINT chk_categoria_estado
        CHECK (estado_categoria IN ('activo', 'inactivo'))
);

CREATE TABLE formato (
    id_formato          SERIAL       NOT NULL,
    nombre_formato      VARCHAR(255) NOT NULL,
    descripcion_formato VARCHAR(255),
    estado_formato      VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT formato_pkey PRIMARY KEY (id_formato),
    CONSTRAINT chk_formato_estado
        CHECK (estado_formato IN ('activo', 'inactivo'))
);

CREATE TABLE genero_musical (
    id_genero_musical          SERIAL       NOT NULL,
    nombre_genero_musical      VARCHAR(255) NOT NULL,
    descripcion_genero_musical VARCHAR(255),
    estado_genero_musical      VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT genero_musical_pkey PRIMARY KEY (id_genero_musical),
    CONSTRAINT chk_genero_musical_estado
        CHECK (estado_genero_musical IN ('activo', 'inactivo'))
);

CREATE TABLE artista (
    id_artista          SERIAL       NOT NULL,
    nombre_artista      VARCHAR(255) NOT NULL,
    pais_origen_artista VARCHAR(255),
    anio_inicio_artista INTEGER,
    estado_artista      VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT artista_pkey PRIMARY KEY (id_artista),
    CONSTRAINT chk_artista_estado
        CHECK (estado_artista IN ('activo', 'inactivo'))
);

-- ── Personas / terceros ──────────────────────────────────────────────────────

CREATE TABLE cliente (
    id_cliente             SERIAL       NOT NULL,
    nombre_cliente         VARCHAR(255) NOT NULL,
    apellido_cliente       VARCHAR(255) NOT NULL,
    telefono_cliente       VARCHAR(255),
    correo_cliente         VARCHAR(255),
    direccion_cliente      VARCHAR(255),
    fecha_registro_cliente DATE         NOT NULL,
    estado_cliente         VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_inactivacion     DATE,

    CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente),
    CONSTRAINT chk_cliente_estado
        CHECK (estado_cliente IN ('activo', 'inactivo'))
);

CREATE TABLE empleado (
    id_empleado        SERIAL       NOT NULL,
    nombre_empleado    VARCHAR(255) NOT NULL,
    apellido_empleado  VARCHAR(255) NOT NULL,
    telefono_empleado  VARCHAR(255),
    correo_empleado    VARCHAR(255),
    fecha_contratacion DATE         NOT NULL,
    estado_empleado    VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,

    CONSTRAINT empleado_pkey PRIMARY KEY (id_empleado),
    CONSTRAINT chk_empleado_estado
        CHECK (estado_empleado IN ('activo', 'inactivo'))
);

CREATE TABLE proveedor (
    id_proveedor              SERIAL       NOT NULL,
    nombre_proveedor          VARCHAR(255) NOT NULL,
    telefono_proveedor        VARCHAR(255),
    correo_proveedor          VARCHAR(255),
    direccion_proveedor       VARCHAR(255),
    nombre_contacto_proveedor VARCHAR(255),
    estado_proveedor          VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_inactivacion        DATE,

    CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor),
    CONSTRAINT chk_proveedor_estado
        CHECK (estado_proveedor IN ('activo', 'inactivo'))
);

-- ── Productos ────────────────────────────────────────────────────────────────

CREATE TABLE producto (
    id_producto          SERIAL        NOT NULL,
    titulo_producto      VARCHAR(255)  NOT NULL,
    descripcion_producto VARCHAR(255),
    anio_lanzamiento     INTEGER,
    precio_venta         DECIMAL(10,2) NOT NULL,
    stock_actual         INTEGER       NOT NULL DEFAULT 0,
    stock_minimo         INTEGER       NOT NULL DEFAULT 0,
    codigo_sku           VARCHAR(255)  NOT NULL,
    estado_producto      VARCHAR(30)   NOT NULL DEFAULT 'activo',
    fecha_inactivacion   DATE,
    id_categoria         INTEGER       NOT NULL,
    id_formato           INTEGER       NOT NULL,

    CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
    CONSTRAINT producto_sku_unique UNIQUE (codigo_sku),
    CONSTRAINT producto_id_categoria_fkey
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT producto_id_formato_fkey
        FOREIGN KEY (id_formato) REFERENCES formato(id_formato)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_producto_estado
        CHECK (estado_producto IN ('activo', 'inactivo', 'agotado', 'descontinuado')),
    CONSTRAINT chk_producto_precio_positivo CHECK (precio_venta >= 0),
    CONSTRAINT chk_producto_stock_actual CHECK (stock_actual >= 0),
    CONSTRAINT chk_producto_stock_minimo CHECK (stock_minimo >= 0)
);

CREATE TABLE producto_artista (
    id_producto INTEGER NOT NULL,
    id_artista  INTEGER NOT NULL,

    CONSTRAINT producto_artista_pkey PRIMARY KEY (id_producto, id_artista),
    CONSTRAINT producto_artista_prod_fkey
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT producto_artista_artista_fkey
        FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE producto_genero (
    id_producto       INTEGER NOT NULL,
    id_genero_musical INTEGER NOT NULL,

    CONSTRAINT producto_genero_pkey PRIMARY KEY (id_producto, id_genero_musical),
    CONSTRAINT producto_genero_prod_fkey
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT producto_genero_genero_fkey
        FOREIGN KEY (id_genero_musical) REFERENCES genero_musical(id_genero_musical)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ── Usuarios / autenticación ─────────────────────────────────────────────────

CREATE TABLE usuario (
    id_usuario         SERIAL       NOT NULL,
    correo_usuario     VARCHAR(255) NOT NULL,
    contrasena_hash    VARCHAR(255) NOT NULL,
    rol_usuario        VARCHAR(20)  NOT NULL,
    estado_usuario     VARCHAR(20)  NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    id_cliente         INTEGER UNIQUE,
    id_empleado        INTEGER UNIQUE,
    id_proveedor       INTEGER UNIQUE,

    CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT usuario_correo_unique UNIQUE (correo_usuario),
    CONSTRAINT usuario_id_cliente_fkey
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT usuario_id_empleado_fkey
        FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT usuario_id_proveedor_fkey
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_usuario_rol
        CHECK (rol_usuario IN ('admin', 'empleado', 'cliente', 'proveedor')),
    CONSTRAINT chk_usuario_estado
        CHECK (estado_usuario IN ('activo', 'bloqueado', 'inactivo'))
);

-- ── Ventas ───────────────────────────────────────────────────────────────────

CREATE TABLE venta (
    id_venta        SERIAL        NOT NULL,
    fecha_venta     DATE          NOT NULL,
    descuento_venta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago     VARCHAR(255)  NOT NULL,
    estado_venta    VARCHAR(20)   NOT NULL DEFAULT 'pendiente',
    id_cliente      INTEGER       NOT NULL,
    id_empleado     INTEGER,

    CONSTRAINT venta_pkey PRIMARY KEY (id_venta),
    CONSTRAINT venta_id_cliente_fkey
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT venta_id_empleado_fkey
        FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_venta_estado
        CHECK (estado_venta IN ('pendiente', 'completada', 'cancelada')),
    CONSTRAINT chk_venta_descuento CHECK (descuento_venta >= 0)
);

CREATE TABLE detalle_venta (
    id_detalle_venta      SERIAL        NOT NULL,
    id_venta              INTEGER       NOT NULL,
    id_producto           INTEGER       NOT NULL,
    cantidad_vendida      INTEGER       NOT NULL,
    precio_unitario_venta DECIMAL(10,2) NOT NULL,
    descuento_detalle     DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT detalle_venta_pkey PRIMARY KEY (id_detalle_venta),
    CONSTRAINT detalle_venta_unique UNIQUE (id_venta, id_producto),
    CONSTRAINT detalle_venta_id_venta_fkey
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT detalle_venta_id_prod_fkey
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_detalle_venta_cantidad CHECK (cantidad_vendida > 0),
    CONSTRAINT chk_detalle_venta_precio CHECK (precio_unitario_venta >= 0),
    CONSTRAINT chk_detalle_venta_descuento CHECK (descuento_detalle >= 0)
);

-- ── Compras a proveedor ──────────────────────────────────────────────────────

CREATE TABLE compra_proveedor (
    id_compra_proveedor    SERIAL       NOT NULL,
    fecha_compra_proveedor DATE         NOT NULL,
    estado_compra          VARCHAR(20)  NOT NULL DEFAULT 'pendiente',
    id_proveedor           INTEGER      NOT NULL,
    id_empleado            INTEGER      NOT NULL,

    CONSTRAINT compra_proveedor_pkey PRIMARY KEY (id_compra_proveedor),
    CONSTRAINT compra_proveedor_id_prov_fkey
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT compra_proveedor_id_emp_fkey
        FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_compra_proveedor_estado
        CHECK (estado_compra IN ('pendiente', 'recibida', 'cancelada'))
);

CREATE TABLE detalle_compra_proveedor (
    id_detalle_compra_proveedor SERIAL        NOT NULL,
    id_compra_proveedor         INTEGER       NOT NULL,
    id_producto                 INTEGER       NOT NULL,
    cantidad_comprada           INTEGER       NOT NULL,
    costo_unitario_compra       DECIMAL(10,2) NOT NULL,

    CONSTRAINT detalle_compra_pkey PRIMARY KEY (id_detalle_compra_proveedor),
    CONSTRAINT detalle_compra_unique UNIQUE (id_compra_proveedor, id_producto),
    CONSTRAINT detalle_compra_comp_fkey
        FOREIGN KEY (id_compra_proveedor) REFERENCES compra_proveedor(id_compra_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT detalle_compra_prod_fkey
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_compra_cantidad CHECK (cantidad_comprada > 0),
    CONSTRAINT chk_compra_costo CHECK (costo_unitario_compra >= 0)
);

-- ── Carrito de compras ───────────────────────────────────────────────────────

CREATE TABLE carrito (
    id_carrito          SERIAL        NOT NULL,
    id_cliente          INTEGER       NOT NULL,
    estado_carrito      VARCHAR(20)   NOT NULL DEFAULT 'activo',
    fecha_creacion      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito),
    CONSTRAINT carrito_id_cliente_fkey
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_carrito_estado
        CHECK (estado_carrito IN ('activo', 'convertido', 'abandonado', 'cancelado'))
);

CREATE TABLE carrito_item (
    id_carrito_item          SERIAL        NOT NULL,
    id_carrito               INTEGER       NOT NULL,
    id_producto              INTEGER       NOT NULL,
    cantidad                 INTEGER       NOT NULL,
    precio_unitario_snapshot DECIMAL(10,2) NOT NULL,
    fecha_agregado           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT carrito_item_pkey PRIMARY KEY (id_carrito_item),
    CONSTRAINT carrito_item_unique UNIQUE (id_carrito, id_producto),
    CONSTRAINT carrito_item_id_carrito_fkey
        FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT carrito_item_id_producto_fkey
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_carrito_item_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_carrito_item_precio CHECK (precio_unitario_snapshot >= 0)
);

-- ── Índices explícitos ───────────────────────────────────────────────────────
-- idx_producto_titulo: búsqueda frecuente de productos por título.
-- idx_venta_fecha: reportes y ordenamientos por fecha de venta.
-- idx_cliente_correo: lookup de clientes por correo.
-- idx_carrito_cliente_estado: acceso rápido al carrito activo de un cliente.
-- uq_carrito_activo_por_cliente: evita más de un carrito activo por cliente.

CREATE INDEX idx_producto_titulo ON producto(titulo_producto);
CREATE INDEX idx_venta_fecha ON venta(fecha_venta);
CREATE INDEX idx_cliente_correo ON cliente(correo_cliente);
CREATE INDEX idx_carrito_cliente_estado ON carrito(id_cliente, estado_carrito);

CREATE UNIQUE INDEX uq_carrito_activo_por_cliente
    ON carrito(id_cliente)
    WHERE estado_carrito = 'activo';

-- ── Views para reportes SQL ──────────────────────────────────────────────────

CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT
    v.id_venta,
    v.fecha_venta,
    v.metodo_pago,
    v.estado_venta,
    v.descuento_venta,
    (c.nombre_cliente || ' ' || c.apellido_cliente) AS cliente,
    c.correo_cliente,
    COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Venta Online') AS empleado,
    COUNT(dv.id_detalle_venta)::INT AS total_items,
    COALESCE(SUM(
        dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
    ), 0) AS total_bruto,
    ROUND(
        COALESCE(SUM(
            dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
        ), 0) - v.descuento_venta,
        2
    ) AS total_neto,
    ROUND(
        (COALESCE(SUM(
            dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
        ), 0) - v.descuento_venta) * 0.12,
        2
    ) AS iva_12,
    ROUND(
        (COALESCE(SUM(
            dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
        ), 0) - v.descuento_venta) * 1.12,
        2
    ) AS total
FROM venta v
JOIN cliente c ON c.id_cliente = v.id_cliente
LEFT JOIN empleado e ON e.id_empleado = v.id_empleado
LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
GROUP BY
    v.id_venta,
    v.fecha_venta,
    v.metodo_pago,
    v.estado_venta,
    v.descuento_venta,
    c.nombre_cliente,
    c.apellido_cliente,
    c.correo_cliente,
    e.nombre_empleado,
    e.apellido_empleado;

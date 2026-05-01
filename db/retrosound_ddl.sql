-- =============================================================================
-- RetroSound Store
-- Vernel Josue Hernández Cáceres
-- Base de Datos 1 - Proyecto 2
-- Universidad del Valle de Guatemala
-- DBMS: PostgreSQL 17
-- =============================================================================

-- ── Tipos enumerados ──────────────────────────────────────────────────────────

CREATE TYPE "EstadoGeneral"  AS ENUM ('activo', 'inactivo');
CREATE TYPE "EstadoProducto" AS ENUM ('activo', 'inactivo', 'agotado', 'descontinuado');
CREATE TYPE "EstadoUsuario"  AS ENUM ('activo', 'bloqueado', 'inactivo');
CREATE TYPE "RolUsuario"     AS ENUM ('admin', 'empleado', 'cliente', 'proveedor');
CREATE TYPE "EstadoVenta"    AS ENUM ('pendiente', 'completada', 'cancelada');
CREATE TYPE "EstadoCompra"   AS ENUM ('pendiente', 'recibida', 'cancelada');

-- ── Catálogos ─────────────────────────────────────────────────────────────────

CREATE TABLE categoria (
    id_categoria          SERIAL          NOT NULL,
    nombre_categoria      VARCHAR(255)    NOT NULL,
    descripcion_categoria VARCHAR(255),
    estado_categoria      "EstadoGeneral" NOT NULL DEFAULT 'activo',
    CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria)
);

CREATE TABLE formato (
    id_formato          SERIAL          NOT NULL,
    nombre_formato      VARCHAR(255)    NOT NULL,
    descripcion_formato VARCHAR(255),
    estado_formato      "EstadoGeneral" NOT NULL DEFAULT 'activo',
    CONSTRAINT formato_pkey PRIMARY KEY (id_formato)
);

CREATE TABLE genero_musical (
    id_genero_musical          SERIAL          NOT NULL,
    nombre_genero_musical      VARCHAR(255)    NOT NULL,
    descripcion_genero_musical VARCHAR(255),
    estado_genero_musical      "EstadoGeneral" NOT NULL DEFAULT 'activo',
    CONSTRAINT genero_musical_pkey PRIMARY KEY (id_genero_musical)
);

CREATE TABLE artista (
    id_artista         SERIAL          NOT NULL,
    nombre_artista     VARCHAR(255)    NOT NULL,
    pais_origen_artista VARCHAR(255),
    anio_inicio_artista INTEGER,
    estado_artista     "EstadoGeneral" NOT NULL DEFAULT 'activo',
    CONSTRAINT artista_pkey PRIMARY KEY (id_artista)
);

-- ── Producto ──────────────────────────────────────────────────────────────────

CREATE TABLE producto (
    id_producto       SERIAL           NOT NULL,
    titulo_producto   VARCHAR(255)     NOT NULL,
    descripcion_producto VARCHAR(255),
    anio_lanzamiento  INTEGER,
    precio_venta      DECIMAL(10,2)    NOT NULL,
    stock_actual      INTEGER          NOT NULL DEFAULT 0,
    stock_minimo      INTEGER          NOT NULL DEFAULT 0,
    codigo_sku        VARCHAR(255)     NOT NULL,
    estado_producto   "EstadoProducto" NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    id_categoria      INTEGER          NOT NULL,
    id_formato        INTEGER          NOT NULL,
    CONSTRAINT producto_pkey          PRIMARY KEY (id_producto),
    CONSTRAINT producto_sku_unique    UNIQUE      (codigo_sku),
    CONSTRAINT producto_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CONSTRAINT producto_id_formato_fkey   FOREIGN KEY (id_formato)   REFERENCES formato(id_formato),
    CONSTRAINT chk_producto_precio_positivo CHECK (precio_venta >= 0),
    CONSTRAINT chk_producto_stock_actual    CHECK (stock_actual  >= 0),
    CONSTRAINT chk_producto_stock_minimo    CHECK (stock_minimo  >= 0)
);

-- Tablas asociativas producto ↔ artista / género
CREATE TABLE producto_artista (
    id_producto INTEGER NOT NULL,
    id_artista  INTEGER NOT NULL,
    CONSTRAINT producto_artista_pkey         PRIMARY KEY (id_producto, id_artista),
    CONSTRAINT producto_artista_prod_fkey    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CONSTRAINT producto_artista_artista_fkey FOREIGN KEY (id_artista)  REFERENCES artista(id_artista)
);

CREATE TABLE producto_genero (
    id_producto       INTEGER NOT NULL,
    id_genero_musical INTEGER NOT NULL,
    CONSTRAINT producto_genero_pkey         PRIMARY KEY (id_producto, id_genero_musical),
    CONSTRAINT producto_genero_prod_fkey    FOREIGN KEY (id_producto)       REFERENCES producto(id_producto),
    CONSTRAINT producto_genero_genero_fkey  FOREIGN KEY (id_genero_musical) REFERENCES genero_musical(id_genero_musical)
);

-- ── Personas ──────────────────────────────────────────────────────────────────

CREATE TABLE cliente (
    id_cliente              SERIAL          NOT NULL,
    nombre_cliente          VARCHAR(255)    NOT NULL,
    apellido_cliente        VARCHAR(255)    NOT NULL,
    telefono_cliente        VARCHAR(255),
    correo_cliente          VARCHAR(255),
    direccion_cliente       VARCHAR(255),
    fecha_registro_cliente  DATE            NOT NULL,
    estado_cliente          "EstadoGeneral" NOT NULL DEFAULT 'activo',
    fecha_inactivacion      DATE,
    CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente)
);

CREATE TABLE empleado (
    id_empleado         SERIAL          NOT NULL,
    nombre_empleado     VARCHAR(255)    NOT NULL,
    apellido_empleado   VARCHAR(255)    NOT NULL,
    telefono_empleado   VARCHAR(255),
    correo_empleado     VARCHAR(255),
    fecha_contratacion  DATE            NOT NULL,
    estado_empleado     "EstadoGeneral" NOT NULL DEFAULT 'activo',
    fecha_inactivacion  DATE,
    CONSTRAINT empleado_pkey PRIMARY KEY (id_empleado)
);

CREATE TABLE proveedor (
    id_proveedor            SERIAL          NOT NULL,
    nombre_proveedor        VARCHAR(255)    NOT NULL,
    telefono_proveedor      VARCHAR(255),
    correo_proveedor        VARCHAR(255),
    direccion_proveedor     VARCHAR(255),
    nombre_contacto_proveedor VARCHAR(255),
    estado_proveedor        "EstadoGeneral" NOT NULL DEFAULT 'activo',
    fecha_inactivacion      DATE,
    CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor)
);

-- ── Usuarios / autenticación ──────────────────────────────────────────────────

CREATE TABLE usuario (
    id_usuario        SERIAL          NOT NULL,
    correo_usuario    VARCHAR(255)    NOT NULL,
    contrasena_hash   VARCHAR(255)    NOT NULL,
    rol_usuario       "RolUsuario"    NOT NULL,
    estado_usuario    "EstadoUsuario" NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    id_cliente        INTEGER         UNIQUE,
    id_empleado       INTEGER         UNIQUE,
    id_proveedor      INTEGER         UNIQUE,
    CONSTRAINT usuario_pkey              PRIMARY KEY (id_usuario),
    CONSTRAINT usuario_correo_unique     UNIQUE      (correo_usuario),
    CONSTRAINT usuario_id_cliente_fkey   FOREIGN KEY (id_cliente)   REFERENCES cliente(id_cliente),
    CONSTRAINT usuario_id_empleado_fkey  FOREIGN KEY (id_empleado)  REFERENCES empleado(id_empleado),
    CONSTRAINT usuario_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

-- ── Ventas ────────────────────────────────────────────────────────────────────

CREATE TABLE venta (
    id_venta        SERIAL        NOT NULL,
    fecha_venta     DATE          NOT NULL,
    descuento_venta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago     VARCHAR(255)  NOT NULL,
    estado_venta    "EstadoVenta" NOT NULL DEFAULT 'pendiente',
    id_cliente      INTEGER       NOT NULL,
    id_empleado     INTEGER       NOT NULL,
    CONSTRAINT venta_pkey              PRIMARY KEY (id_venta),
    CONSTRAINT venta_id_cliente_fkey   FOREIGN KEY (id_cliente)  REFERENCES cliente(id_cliente),
    CONSTRAINT venta_id_empleado_fkey  FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    CONSTRAINT chk_venta_descuento     CHECK (descuento_venta >= 0)
);

CREATE TABLE detalle_venta (
    id_detalle_venta      SERIAL        NOT NULL,
    id_venta              INTEGER       NOT NULL,
    id_producto           INTEGER       NOT NULL,
    cantidad_vendida      INTEGER       NOT NULL,
    precio_unitario_venta DECIMAL(10,2) NOT NULL,
    descuento_detalle     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT detalle_venta_pkey           PRIMARY KEY (id_detalle_venta),
    CONSTRAINT detalle_venta_unique         UNIQUE      (id_venta, id_producto),
    CONSTRAINT detalle_venta_id_venta_fkey  FOREIGN KEY (id_venta)    REFERENCES venta(id_venta),
    CONSTRAINT detalle_venta_id_prod_fkey   FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CONSTRAINT chk_detalle_venta_cantidad   CHECK (cantidad_vendida      > 0),
    CONSTRAINT chk_detalle_venta_precio     CHECK (precio_unitario_venta >= 0),
    CONSTRAINT chk_detalle_venta_descuento  CHECK (descuento_detalle     >= 0)
);

-- ── Compras a proveedor ───────────────────────────────────────────────────────

CREATE TABLE compra_proveedor (
    id_compra_proveedor    SERIAL         NOT NULL,
    fecha_compra_proveedor DATE           NOT NULL,
    estado_compra          "EstadoCompra" NOT NULL DEFAULT 'pendiente',
    id_proveedor           INTEGER        NOT NULL,
    id_empleado            INTEGER        NOT NULL,
    CONSTRAINT compra_proveedor_pkey             PRIMARY KEY (id_compra_proveedor),
    CONSTRAINT compra_proveedor_id_prov_fkey     FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    CONSTRAINT compra_proveedor_id_emp_fkey      FOREIGN KEY (id_empleado)  REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_compra_proveedor (
    id_detalle_compra_proveedor SERIAL        NOT NULL,
    id_compra_proveedor         INTEGER       NOT NULL,
    id_producto                 INTEGER       NOT NULL,
    cantidad_comprada           INTEGER       NOT NULL,
    costo_unitario_compra       DECIMAL(10,2) NOT NULL,
    CONSTRAINT detalle_compra_pkey          PRIMARY KEY (id_detalle_compra_proveedor),
    CONSTRAINT detalle_compra_unique        UNIQUE      (id_compra_proveedor, id_producto),
    CONSTRAINT detalle_compra_comp_fkey     FOREIGN KEY (id_compra_proveedor) REFERENCES compra_proveedor(id_compra_proveedor),
    CONSTRAINT detalle_compra_prod_fkey     FOREIGN KEY (id_producto)         REFERENCES producto(id_producto),
    CONSTRAINT chk_compra_cantidad          CHECK (cantidad_comprada     > 0),
    CONSTRAINT chk_compra_costo             CHECK (costo_unitario_compra >= 0)
);

-- ── Índices explícitos ────────────────────────────────────────────────────────
-- Justificación:
--   idx_producto_titulo  → búsqueda frecuente de productos por nombre en la UI
--   idx_venta_fecha      → reportes y filtros de ventas por rango de fechas
--   idx_cliente_correo   → lookup de cliente al iniciar sesión o registrarse

CREATE INDEX idx_producto_titulo ON producto(titulo_producto);
CREATE INDEX idx_venta_fecha     ON venta(fecha_venta);
CREATE INDEX idx_cliente_correo  ON cliente(correo_cliente);

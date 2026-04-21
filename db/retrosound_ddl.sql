# =============================================================================
# RetroSound Store
# Vernel Josue Hernández Cáceres
# Base de Datos 1 - Proyecto 2
# Universidad del Valle de Guatemala
# =============================================================================

# Credenciales fijas para calificación: usuario proy2, contraseña secret
DROP DATABASE IF EXISTS retrosound;
CREATE DATABASE IF NOT EXISTS retrosound;
USE retrosound;

# =============================================================================
# TABLAS DE CATÁLOGO
# Estas tablas no tienen FK hacia otras tablas.
# =============================================================================

CREATE TABLE IF NOT EXISTS categoria(
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nombre_categoria VARCHAR(255) NOT NULL,
    descripcion_categoria VARCHAR(255),
    estado_categoria ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_categoria)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS formato(
    id_formato INT NOT NULL AUTO_INCREMENT,
    nombre_formato VARCHAR(255) NOT NULL,
    descripcion_formato VARCHAR(255),
    estado_formato ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_formato)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS genero_musical(
    id_genero_musical INT NOT NULL AUTO_INCREMENT,
    nombre_genero_musical VARCHAR(255) NOT NULL,
    descripcion_genero_musical VARCHAR(255),
    estado_genero_musical ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_genero_musical)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS artista(
    id_artista INT NOT NULL AUTO_INCREMENT,
    nombre_artista VARCHAR(255) NOT NULL,
    pais_origen_artista VARCHAR(255),
    anio_inicio_artista INT,
    estado_artista ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    PRIMARY KEY (id_artista)
) ENGINE=INNODB;

# =============================================================================
# TABLA PRODUCTO
# Depende de: categoria, formato
# =============================================================================

CREATE TABLE IF NOT EXISTS producto(
    id_producto INT NOT NULL AUTO_INCREMENT,
    titulo_producto VARCHAR(255) NOT NULL,
    descripcion_producto VARCHAR(255),
    anio_lanzamiento INT,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    codigo_sku VARCHAR(255) NOT NULL,
    estado_producto ENUM('activo', 'inactivo', 'agotado', 'descontinuado') NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    id_categoria INT NOT NULL,
    id_formato INT NOT NULL,
    PRIMARY KEY (id_producto),
    UNIQUE (codigo_sku),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_formato) REFERENCES formato(id_formato),
    CHECK (precio_venta >= 0),
    CHECK (stock_actual >= 0),
    CHECK (stock_minimo >= 0)
) ENGINE=INNODB;

# =============================================================================
# TABLAS ASOCIATIVAS (M:N)
# ProductoArtista: un producto puede tener múltiples artistas y viceversa
# ProductoGenero: un producto puede tener múltiples géneros y viceversa
# =============================================================================

CREATE TABLE IF NOT EXISTS producto_artista(
    id_producto INT NOT NULL,
    id_artista INT NOT NULL,
    PRIMARY KEY (id_producto, id_artista),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_artista) REFERENCES artista(id_artista)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS producto_genero(
    id_producto INT NOT NULL,
    id_genero_musical INT NOT NULL,
    PRIMARY KEY (id_producto, id_genero_musical),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_genero_musical) REFERENCES genero_musical(id_genero_musical)
) ENGINE=INNODB;

# =============================================================================
# TABLAS DE PERSONAS
# Cliente, Empleado y Proveedor no tienen dependencias entre sí.
# =============================================================================

CREATE TABLE IF NOT EXISTS cliente(
    id_cliente INT NOT NULL AUTO_INCREMENT,
    nombre_cliente VARCHAR(255) NOT NULL,
    apellido_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(255),
    correo_cliente VARCHAR(255),
    direccion_cliente VARCHAR(255),
    fecha_registro_cliente DATE NOT NULL,
    estado_cliente ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    PRIMARY KEY (id_cliente)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS empleado(
    id_empleado INT NOT NULL AUTO_INCREMENT,
    nombre_empleado VARCHAR(255) NOT NULL,
    apellido_empleado VARCHAR(255) NOT NULL,
    telefono_empleado VARCHAR(255),
    correo_empleado VARCHAR(255),
    fecha_contratacion DATE NOT NULL,
    estado_empleado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    PRIMARY KEY (id_empleado)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS proveedor(
    id_proveedor INT NOT NULL AUTO_INCREMENT,
    nombre_proveedor VARCHAR(255) NOT NULL,
    telefono_proveedor VARCHAR(255),
    correo_proveedor VARCHAR(255),
    direccion_proveedor VARCHAR(255),
    nombre_contacto_proveedor VARCHAR(255),
    estado_proveedor ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    PRIMARY KEY (id_proveedor)
) ENGINE=INNODB;

# =============================================================================
# TABLA USUARIO
# Depende de: cliente, empleado, proveedor (FK nullable con restricción XOR).
# Solo una de las tres FK puede tener valor según el rol.
# =============================================================================

CREATE TABLE IF NOT EXISTS usuario(
    id_usuario INT NOT NULL AUTO_INCREMENT,
    correo_usuario VARCHAR(255) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol_usuario ENUM('admin', 'empleado', 'cliente', 'proveedor') NOT NULL,
    estado_usuario ENUM('activo', 'bloqueado', 'inactivo') NOT NULL DEFAULT 'activo',
    fecha_inactivacion DATE,
    id_cliente INT,
    id_empleado INT,
    id_proveedor INT,
    PRIMARY KEY (id_usuario),
    UNIQUE (correo_usuario),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
) ENGINE=INNODB;

# =============================================================================
# TABLAS DE VENTAS
# Venta: depende de cliente y empleado
# DetalleVenta: depende de venta y producto
# Un producto solo puede aparecer una vez por venta (UNIQUE)
# =============================================================================

CREATE TABLE IF NOT EXISTS venta(
    id_venta INT NOT NULL AUTO_INCREMENT,
    fecha_venta DATE NOT NULL,
    descuento_venta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    metodo_pago VARCHAR(255) NOT NULL,
    estado_venta ENUM('pendiente', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    PRIMARY KEY (id_venta),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    CHECK (descuento_venta >= 0)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS detalle_venta(
    id_detalle_venta INT NOT NULL AUTO_INCREMENT,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_vendida INT NOT NULL,
    precio_unitario_venta DECIMAL(10,2) NOT NULL,
    descuento_detalle DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id_detalle_venta),
    UNIQUE (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CHECK (cantidad_vendida > 0),
    CHECK (precio_unitario_venta >= 0),
    CHECK (descuento_detalle >= 0)
) ENGINE=INNODB;

# =============================================================================
# TABLAS DE COMPRAS A PROVEEDOR
# CompraProveedor: depende de proveedor y empleado
# DetalleCompraProveedor: depende de compra_proveedor y producto
# Un producto solo puede aparecer una vez por compra (UNIQUE)
# =============================================================================

CREATE TABLE IF NOT EXISTS compra_proveedor(
    id_compra_proveedor INT NOT NULL AUTO_INCREMENT,
    fecha_compra_proveedor DATE NOT NULL,
    estado_compra ENUM('pendiente', 'recibida', 'cancelada') NOT NULL DEFAULT 'pendiente',
    id_proveedor INT NOT NULL,
    id_empleado INT NOT NULL,
    PRIMARY KEY (id_compra_proveedor),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS detalle_compra_proveedor(
    id_detalle_compra_proveedor INT NOT NULL AUTO_INCREMENT,
    id_compra_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_comprada INT NOT NULL,
    costo_unitario_compra DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_detalle_compra_proveedor),
    UNIQUE (id_compra_proveedor, id_producto),
    FOREIGN KEY (id_compra_proveedor) REFERENCES compra_proveedor(id_compra_proveedor),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CHECK (cantidad_comprada > 0),
    CHECK (costo_unitario_compra >= 0)
) ENGINE=INNODB;

# =============================================================================
# ÍNDICES EXPLÍCITOS
# Justificación:
#
# 1. idx_producto_titulo: Las búsquedas de productos por título serán la
#    operación más frecuente en la UI (barra de búsqueda). Sin índice,
#    cada búsqueda recorre toda la tabla Producto.
#
# 2. idx_venta_fecha: Los reportes de ventas filtran por rango de fechas. 
#    Un índice en fecha_venta
#    acelera estas consultas con GROUP BY y funciones de agregación.
#
# 3. idx_cliente_correo: Las búsquedas de clientes por correo electrónico
#    son frecuentes en el proceso de registro de ventas para identificar
#    al cliente.
# =============================================================================

CREATE INDEX idx_producto_titulo ON producto(titulo_producto);
CREATE INDEX idx_venta_fecha ON venta(fecha_venta);
CREATE INDEX idx_cliente_correo ON cliente(correo_cliente);

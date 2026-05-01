-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('activo', 'inactivo', 'agotado', 'descontinuado');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'bloqueado', 'inactivo');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'empleado', 'cliente', 'proveedor');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('pendiente', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('pendiente', 'recibida', 'cancelada');

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "descripcion_categoria" TEXT,
    "estado_categoria" "EstadoGeneral" NOT NULL DEFAULT 'activo',

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "formato" (
    "id_formato" SERIAL NOT NULL,
    "nombre_formato" TEXT NOT NULL,
    "descripcion_formato" TEXT,
    "estado_formato" "EstadoGeneral" NOT NULL DEFAULT 'activo',

    CONSTRAINT "formato_pkey" PRIMARY KEY ("id_formato")
);

-- CreateTable
CREATE TABLE "genero_musical" (
    "id_genero_musical" SERIAL NOT NULL,
    "nombre_genero_musical" TEXT NOT NULL,
    "descripcion_genero_musical" TEXT,
    "estado_genero_musical" "EstadoGeneral" NOT NULL DEFAULT 'activo',

    CONSTRAINT "genero_musical_pkey" PRIMARY KEY ("id_genero_musical")
);

-- CreateTable
CREATE TABLE "artista" (
    "id_artista" SERIAL NOT NULL,
    "nombre_artista" TEXT NOT NULL,
    "pais_origen_artista" TEXT,
    "anio_inicio_artista" INTEGER,
    "estado_artista" "EstadoGeneral" NOT NULL DEFAULT 'activo',

    CONSTRAINT "artista_pkey" PRIMARY KEY ("id_artista")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "titulo_producto" TEXT NOT NULL,
    "descripcion_producto" TEXT,
    "anio_lanzamiento" INTEGER,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "codigo_sku" TEXT NOT NULL,
    "estado_producto" "EstadoProducto" NOT NULL DEFAULT 'activo',
    "fecha_inactivacion" DATE,
    "id_categoria" INTEGER NOT NULL,
    "id_formato" INTEGER NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "producto_artista" (
    "id_producto" INTEGER NOT NULL,
    "id_artista" INTEGER NOT NULL,

    CONSTRAINT "producto_artista_pkey" PRIMARY KEY ("id_producto","id_artista")
);

-- CreateTable
CREATE TABLE "producto_genero" (
    "id_producto" INTEGER NOT NULL,
    "id_genero_musical" INTEGER NOT NULL,

    CONSTRAINT "producto_genero_pkey" PRIMARY KEY ("id_producto","id_genero_musical")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "apellido_cliente" TEXT NOT NULL,
    "telefono_cliente" TEXT,
    "correo_cliente" TEXT,
    "direccion_cliente" TEXT,
    "fecha_registro_cliente" DATE NOT NULL,
    "estado_cliente" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "fecha_inactivacion" DATE,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id_empleado" SERIAL NOT NULL,
    "nombre_empleado" TEXT NOT NULL,
    "apellido_empleado" TEXT NOT NULL,
    "telefono_empleado" TEXT,
    "correo_empleado" TEXT,
    "fecha_contratacion" DATE NOT NULL,
    "estado_empleado" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "fecha_inactivacion" DATE,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" TEXT NOT NULL,
    "telefono_proveedor" TEXT,
    "correo_proveedor" TEXT,
    "direccion_proveedor" TEXT,
    "nombre_contacto_proveedor" TEXT,
    "estado_proveedor" "EstadoGeneral" NOT NULL DEFAULT 'activo',
    "fecha_inactivacion" DATE,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "correo_usuario" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "rol_usuario" "RolUsuario" NOT NULL,
    "estado_usuario" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "fecha_inactivacion" DATE,
    "id_cliente" INTEGER,
    "id_empleado" INTEGER,
    "id_proveedor" INTEGER,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "venta" (
    "id_venta" SERIAL NOT NULL,
    "fecha_venta" DATE NOT NULL,
    "descuento_venta" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "metodo_pago" TEXT NOT NULL,
    "estado_venta" "EstadoVenta" NOT NULL DEFAULT 'pendiente',
    "id_cliente" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,

    CONSTRAINT "venta_pkey" PRIMARY KEY ("id_venta")
);

-- CreateTable
CREATE TABLE "detalle_venta" (
    "id_detalle_venta" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad_vendida" INTEGER NOT NULL,
    "precio_unitario_venta" DECIMAL(10,2) NOT NULL,
    "descuento_detalle" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "detalle_venta_pkey" PRIMARY KEY ("id_detalle_venta")
);

-- CreateTable
CREATE TABLE "compra_proveedor" (
    "id_compra_proveedor" SERIAL NOT NULL,
    "fecha_compra_proveedor" DATE NOT NULL,
    "estado_compra" "EstadoCompra" NOT NULL DEFAULT 'pendiente',
    "id_proveedor" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,

    CONSTRAINT "compra_proveedor_pkey" PRIMARY KEY ("id_compra_proveedor")
);

-- CreateTable
CREATE TABLE "detalle_compra_proveedor" (
    "id_detalle_compra_proveedor" SERIAL NOT NULL,
    "id_compra_proveedor" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad_comprada" INTEGER NOT NULL,
    "costo_unitario_compra" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_compra_proveedor_pkey" PRIMARY KEY ("id_detalle_compra_proveedor")
);

-- CreateIndex
CREATE UNIQUE INDEX "producto_codigo_sku_key" ON "producto"("codigo_sku");

-- CreateIndex
CREATE INDEX "idx_producto_titulo" ON "producto"("titulo_producto");

-- CreateIndex
CREATE INDEX "idx_cliente_correo" ON "cliente"("correo_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_usuario_key" ON "usuario"("correo_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_id_cliente_key" ON "usuario"("id_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_id_empleado_key" ON "usuario"("id_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_id_proveedor_key" ON "usuario"("id_proveedor");

-- CreateIndex
CREATE INDEX "idx_venta_fecha" ON "venta"("fecha_venta");

-- CreateIndex
CREATE UNIQUE INDEX "detalle_venta_id_venta_id_producto_key" ON "detalle_venta"("id_venta", "id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "detalle_compra_proveedor_id_compra_proveedor_id_producto_key" ON "detalle_compra_proveedor"("id_compra_proveedor", "id_producto");

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_formato_fkey" FOREIGN KEY ("id_formato") REFERENCES "formato"("id_formato") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_artista" ADD CONSTRAINT "producto_artista_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_artista" ADD CONSTRAINT "producto_artista_id_artista_fkey" FOREIGN KEY ("id_artista") REFERENCES "artista"("id_artista") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_genero" ADD CONSTRAINT "producto_genero_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_genero" ADD CONSTRAINT "producto_genero_id_genero_musical_fkey" FOREIGN KEY ("id_genero_musical") REFERENCES "genero_musical"("id_genero_musical") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedor"("id_proveedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "venta"("id_venta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_proveedor" ADD CONSTRAINT "compra_proveedor_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedor"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_proveedor" ADD CONSTRAINT "compra_proveedor_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compra_proveedor" ADD CONSTRAINT "detalle_compra_proveedor_id_compra_proveedor_fkey" FOREIGN KEY ("id_compra_proveedor") REFERENCES "compra_proveedor"("id_compra_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compra_proveedor" ADD CONSTRAINT "detalle_compra_proveedor_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

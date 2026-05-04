-- CreateEnum
CREATE TYPE "EstadoCarrito" AS ENUM ('activo', 'convertido', 'abandonado', 'cancelado');

-- CreateTable: carrito
-- Representa una intención de compra antes del checkout.
-- El stock NO se descuenta al agregar items al carrito.
CREATE TABLE "carrito" (
    "id_carrito"          SERIAL NOT NULL,
    "id_cliente"          INTEGER NOT NULL,
    "estado_carrito"      "EstadoCarrito" NOT NULL DEFAULT 'activo',
    "fecha_creacion"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrito_pkey" PRIMARY KEY ("id_carrito")
);

-- CreateTable: carrito_item
-- Cada fila es un producto dentro de un carrito.
-- precio_unitario_snapshot congela el precio al momento de agregar.
CREATE TABLE "carrito_item" (
    "id_carrito_item"          SERIAL NOT NULL,
    "id_carrito"               INTEGER NOT NULL,
    "id_producto"              INTEGER NOT NULL,
    "cantidad"                 INTEGER NOT NULL,
    "precio_unitario_snapshot" DECIMAL(10,2) NOT NULL,
    "fecha_agregado"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrito_item_pkey" PRIMARY KEY ("id_carrito_item")
);

-- CreateIndex: búsqueda eficiente de carrito activo por cliente
CREATE INDEX "idx_carrito_cliente_estado" ON "carrito"("id_cliente", "estado_carrito");

-- CreateIndex: un producto solo puede aparecer una vez dentro del mismo carrito
CREATE UNIQUE INDEX "carrito_item_id_carrito_id_producto_key"
  ON "carrito_item"("id_carrito", "id_producto");

-- AddForeignKey: carrito -> cliente
ALTER TABLE "carrito"
  ADD CONSTRAINT "carrito_id_cliente_fkey"
  FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: carrito_item -> carrito (CASCADE: eliminar carrito borra sus items)
ALTER TABLE "carrito_item"
  ADD CONSTRAINT "carrito_item_id_carrito_fkey"
  FOREIGN KEY ("id_carrito") REFERENCES "carrito"("id_carrito")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: carrito_item -> producto
ALTER TABLE "carrito_item"
  ADD CONSTRAINT "carrito_item_id_producto_fkey"
  FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraints: reglas de negocio sobre valores numéricos
-- cantidad debe ser mayor que 0
-- precio_unitario_snapshot debe ser mayor o igual que 0
ALTER TABLE "carrito_item"
  ADD CONSTRAINT "chk_carrito_item_cantidad" CHECK ("cantidad" > 0),
  ADD CONSTRAINT "chk_carrito_item_precio"   CHECK ("precio_unitario_snapshot" >= 0);

-- PartialUniqueIndex: solo puede existir UN carrito 'activo' por cliente.
-- Prisma no soporta índices únicos parciales en schema.prisma,
-- por lo que este índice se agrega manualmente en la migración SQL.
-- Los carritos con estado convertido, abandonado o cancelado no están restringidos.
CREATE UNIQUE INDEX "uq_carrito_activo_por_cliente"
  ON "carrito" ("id_cliente")
  WHERE "estado_carrito" = 'activo';

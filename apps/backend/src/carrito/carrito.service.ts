import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database';
import { AddCarritoItemDto } from './dto/add-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

type CarritoRow = {
  id_carrito: number;
  estado_carrito: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
};

type CarritoItemRow = {
  id_carrito_item: number;
  id_producto: number;
  titulo_producto: string;
  estado_producto: string;
  stock_actual: number;
  precio_venta: string | number;
  cantidad: number;
  precio_unitario_snapshot: string | number;
  fecha_agregado: Date;
};

@Injectable()
export class CarritoService {
  constructor(private readonly db: DatabaseService) {}

  private async resolveIdCliente(idUsuario: number): Promise<number> {
    const result = await this.db.query<{ id_cliente: number | null }>(
      `
      SELECT u.id_cliente
      FROM usuario u
      JOIN cliente c ON c.id_cliente = u.id_cliente
      WHERE u.id_usuario = $1
        AND u.estado_usuario = 'activo'
        AND c.estado_cliente = 'activo'
      LIMIT 1
      `,
      [idUsuario],
    );

    const idCliente = result.rows[0]?.id_cliente;
    if (!idCliente) {
      throw new ForbiddenException(
        'El usuario autenticado no tiene un perfil de cliente asociado',
      );
    }

    return idCliente;
  }

  private async findActiveCart(idCliente: number) {
    const result = await this.db.query<CarritoRow>(
      `
      SELECT id_carrito, estado_carrito, fecha_creacion, fecha_actualizacion
      FROM carrito
      WHERE id_cliente = $1
        AND estado_carrito = 'activo'
      LIMIT 1
      `,
      [idCliente],
    );

    return result.rows[0] ?? null;
  }

  private async createActiveCart(idCliente: number) {
    const result = await this.db.query<CarritoRow>(
      `
      INSERT INTO carrito (id_cliente, estado_carrito)
      VALUES ($1, 'activo')
      RETURNING id_carrito, estado_carrito, fecha_creacion, fecha_actualizacion
      `,
      [idCliente],
    );

    return result.rows[0];
  }

  private async getCartItems(idCarrito: number) {
    const result = await this.db.query<CarritoItemRow>(
      `
      SELECT
        ci.id_carrito_item,
        ci.id_producto,
        p.titulo_producto,
        p.estado_producto,
        p.stock_actual,
        p.precio_venta,
        ci.cantidad,
        ci.precio_unitario_snapshot,
        ci.fecha_agregado
      FROM carrito_item ci
      JOIN producto p ON p.id_producto = ci.id_producto
      WHERE ci.id_carrito = $1
      ORDER BY ci.id_carrito_item
      `,
      [idCarrito],
    );

    return result.rows;
  }

  private serializeCarrito(carrito: CarritoRow, rows: CarritoItemRow[]) {
    const items = rows.map((item) => {
      const precioSnapshot = Number(item.precio_unitario_snapshot);
      const subtotal = this.roundMoney(item.cantidad * precioSnapshot);

      return {
        idCarritoItem: item.id_carrito_item,
        idProducto: item.id_producto,
        titulo: item.titulo_producto,
        estadoProducto: item.estado_producto,
        stockActual: item.stock_actual,
        precioVenta: Number(item.precio_venta),
        cantidad: item.cantidad,
        precioUnitarioSnapshot: precioSnapshot,
        subtotal,
        fechaAgregado: item.fecha_agregado,
      };
    });

    return {
      idCarrito: carrito.id_carrito,
      estado: carrito.estado_carrito,
      fechaCreacion: carrito.fecha_creacion,
      fechaActualizacion: carrito.fecha_actualizacion,
      items,
      subtotal: this.roundMoney(items.reduce((acc, item) => acc + item.subtotal, 0)),
    };
  }

  async getCarrito(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);
    const carrito = await this.findActiveCart(idCliente);

    if (!carrito) {
      return { idCarrito: null, estado: null, items: [], subtotal: 0 };
    }

    const items = await this.getCartItems(carrito.id_carrito);
    return this.serializeCarrito(carrito, items);
  }

  async addItem(idUsuario: number, dto: AddCarritoItemDto) {
    const idCliente = await this.resolveIdCliente(idUsuario);
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      const productoResult = await client.query<{
        id_producto: number;
        titulo_producto: string;
        precio_venta: string | number;
        stock_actual: number;
        estado_producto: string;
      }>(
        `
        SELECT id_producto, titulo_producto, precio_venta, stock_actual, estado_producto
        FROM producto
        WHERE id_producto = $1
        LIMIT 1
        `,
        [dto.idProducto],
      );
      const producto = productoResult.rows[0];

      if (!producto) throw new NotFoundException('Producto no encontrado');
      if (producto.estado_producto === 'descontinuado' || producto.estado_producto === 'inactivo') {
        throw new BadRequestException(
          `El producto "${producto.titulo_producto}" no está disponible`,
        );
      }
      if (producto.stock_actual <= 0) {
        throw new BadRequestException(
          `El producto "${producto.titulo_producto}" no tiene stock disponible`,
        );
      }

      let carrito = await client.query<CarritoRow>(
        `
        SELECT id_carrito, estado_carrito, fecha_creacion, fecha_actualizacion
        FROM carrito
        WHERE id_cliente = $1
          AND estado_carrito = 'activo'
        LIMIT 1
        `,
        [idCliente],
      );

      let idCarrito = carrito.rows[0]?.id_carrito;
      if (!idCarrito) {
        carrito = await client.query<CarritoRow>(
          `
          INSERT INTO carrito (id_cliente, estado_carrito)
          VALUES ($1, 'activo')
          RETURNING id_carrito, estado_carrito, fecha_creacion, fecha_actualizacion
          `,
          [idCliente],
        );
        idCarrito = carrito.rows[0].id_carrito;
      }

      const itemExistente = await client.query<{
        id_carrito_item: number;
        cantidad: number;
      }>(
        `
        SELECT id_carrito_item, cantidad
        FROM carrito_item
        WHERE id_carrito = $1
          AND id_producto = $2
        LIMIT 1
        `,
        [idCarrito, dto.idProducto],
      );

      const existente = itemExistente.rows[0];
      if (existente) {
        const nuevaCantidad = existente.cantidad + dto.cantidad;
        if (nuevaCantidad > producto.stock_actual) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo_producto}": ` +
              `disponible=${producto.stock_actual}, en carrito=${existente.cantidad}, ` +
              `solicitado adicional=${dto.cantidad}`,
          );
        }

        await client.query(
          `
          UPDATE carrito_item
          SET cantidad = $1
          WHERE id_carrito_item = $2
          `,
          [nuevaCantidad, existente.id_carrito_item],
        );
      } else {
        if (dto.cantidad > producto.stock_actual) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo_producto}": ` +
              `disponible=${producto.stock_actual}, solicitado=${dto.cantidad}`,
          );
        }

        await client.query(
          `
          INSERT INTO carrito_item
            (id_carrito, id_producto, cantidad, precio_unitario_snapshot)
          VALUES
            ($1, $2, $3, $4)
          `,
          [idCarrito, dto.idProducto, dto.cantidad, producto.precio_venta],
        );
      }

      await client.query(
        `
        UPDATE carrito
        SET fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_carrito = $1
        `,
        [idCarrito],
      );

      await client.query('COMMIT');
      return this.getCarrito(idUsuario);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateItem(
    idUsuario: number,
    idCarritoItem: number,
    dto: UpdateCarritoItemDto,
  ) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const itemResult = await this.db.query<CarritoItemRow>(
      `
      SELECT
        ci.id_carrito_item,
        ci.id_producto,
        p.titulo_producto,
        p.estado_producto,
        p.stock_actual,
        p.precio_venta,
        ci.cantidad,
        ci.precio_unitario_snapshot,
        ci.fecha_agregado
      FROM carrito_item ci
      JOIN carrito c ON c.id_carrito = ci.id_carrito
      JOIN producto p ON p.id_producto = ci.id_producto
      WHERE ci.id_carrito_item = $1
        AND c.id_cliente = $2
        AND c.estado_carrito = 'activo'
      LIMIT 1
      `,
      [idCarritoItem, idCliente],
    );
    const item = itemResult.rows[0];

    if (!item) {
      throw new NotFoundException('Item no encontrado en tu carrito activo');
    }

    if (dto.cantidad > item.stock_actual) {
      throw new BadRequestException(
        `Stock insuficiente para "${item.titulo_producto}": ` +
          `disponible=${item.stock_actual}, solicitado=${dto.cantidad}`,
      );
    }

    const updatedResult = await this.db.query<CarritoItemRow>(
      `
      UPDATE carrito_item
      SET cantidad = $1
      WHERE id_carrito_item = $2
      RETURNING
        id_carrito_item,
        id_producto,
        cantidad,
        precio_unitario_snapshot,
        fecha_agregado,
        (SELECT titulo_producto FROM producto WHERE id_producto = carrito_item.id_producto) AS titulo_producto,
        (SELECT estado_producto FROM producto WHERE id_producto = carrito_item.id_producto) AS estado_producto,
        (SELECT stock_actual FROM producto WHERE id_producto = carrito_item.id_producto) AS stock_actual,
        (SELECT precio_venta FROM producto WHERE id_producto = carrito_item.id_producto) AS precio_venta
      `,
      [dto.cantidad, idCarritoItem],
    );
    const actualizado = updatedResult.rows[0];
    const precioSnapshot = Number(actualizado.precio_unitario_snapshot);

    return {
      idCarritoItem: actualizado.id_carrito_item,
      idProducto: actualizado.id_producto,
      titulo: actualizado.titulo_producto,
      estadoProducto: actualizado.estado_producto,
      stockActual: actualizado.stock_actual,
      cantidad: actualizado.cantidad,
      precioUnitarioSnapshot: precioSnapshot,
      subtotal: this.roundMoney(actualizado.cantidad * precioSnapshot),
    };
  }

  async removeItem(idUsuario: number, idCarritoItem: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const item = await this.db.query<{ id_carrito_item: number }>(
      `
      SELECT ci.id_carrito_item
      FROM carrito_item ci
      JOIN carrito c ON c.id_carrito = ci.id_carrito
      WHERE ci.id_carrito_item = $1
        AND c.id_cliente = $2
        AND c.estado_carrito = 'activo'
      LIMIT 1
      `,
      [idCarritoItem, idCliente],
    );

    if (item.rowCount === 0) {
      throw new NotFoundException('Item no encontrado en tu carrito activo');
    }

    await this.db.query(
      `
      DELETE FROM carrito_item
      WHERE id_carrito_item = $1
      `,
      [idCarritoItem],
    );

    return { message: 'Item eliminado del carrito' };
  }

  async cancelarCarrito(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);
    const carrito = await this.findActiveCart(idCliente);

    if (!carrito) {
      throw new NotFoundException('No tienes un carrito activo para cancelar');
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM carrito_item WHERE id_carrito = $1', [
        carrito.id_carrito,
      ]);
      await client.query(
        `
        UPDATE carrito
        SET estado_carrito = 'cancelado',
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_carrito = $1
        `,
        [carrito.id_carrito],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return {
      message: 'Carrito cancelado exitosamente',
      idCarrito: carrito.id_carrito,
    };
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}

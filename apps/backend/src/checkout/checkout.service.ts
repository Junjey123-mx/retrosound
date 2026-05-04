import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

type CheckoutItemRow = {
  id_carrito: number;
  id_carrito_item: number;
  id_producto: number;
  cantidad: number;
  precio_unitario_snapshot: string | number;
  titulo_producto: string;
};

@Injectable()
export class CheckoutService {
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

  async checkout(idUsuario: number, dto: CreateCheckoutDto) {
    const idCliente = await this.resolveIdCliente(idUsuario);
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      const carritoResult = await client.query<{ id_carrito: number }>(
        `
        SELECT id_carrito
        FROM carrito
        WHERE id_cliente = $1
          AND estado_carrito = 'activo'
        LIMIT 1
        `,
        [idCliente],
      );
      const idCarrito = carritoResult.rows[0]?.id_carrito;

      if (!idCarrito) {
        throw new NotFoundException(
          'No tienes un carrito activo para realizar el checkout',
        );
      }

      const itemsResult = await client.query<CheckoutItemRow>(
        `
        SELECT
          ci.id_carrito,
          ci.id_carrito_item,
          ci.id_producto,
          ci.cantidad,
          ci.precio_unitario_snapshot,
          p.titulo_producto
        FROM carrito_item ci
        JOIN producto p ON p.id_producto = ci.id_producto
        WHERE ci.id_carrito = $1
        ORDER BY ci.id_carrito_item
        `,
        [idCarrito],
      );
      const items = itemsResult.rows;

      if (items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      for (const item of items) {
        const productoResult = await client.query<{
          id_producto: number;
          stock_actual: number;
          titulo_producto: string;
          estado_producto: string;
        }>(
          `
          SELECT id_producto, stock_actual, titulo_producto, estado_producto
          FROM producto
          WHERE id_producto = $1
          FOR UPDATE
          `,
          [item.id_producto],
        );
        const producto = productoResult.rows[0];

        if (!producto) {
          throw new NotFoundException(
            `El producto con id ${item.id_producto} ya no existe`,
          );
        }

        if (producto.estado_producto === 'descontinuado' || producto.estado_producto === 'inactivo') {
          throw new BadRequestException(
            `El producto "${producto.titulo_producto}" ya no está disponible`,
          );
        }

        if (producto.stock_actual < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo_producto}": ` +
              `disponible=${producto.stock_actual}, en carrito=${item.cantidad}`,
          );
        }
      }

      const totalBruto = this.roundMoney(
        items.reduce(
          (acc, item) => acc + item.cantidad * Number(item.precio_unitario_snapshot),
          0,
        ),
      );
      const descuentoVenta = Number(dto.descuento ?? 0);

      if (descuentoVenta > totalBruto) {
        throw new BadRequestException(
          'El descuento no puede superar el subtotal de la venta.',
        );
      }

      const ventaResult = await client.query<{
        id_venta: number;
        fecha_venta: Date;
        metodo_pago: string;
        estado_venta: string;
      }>(
        `
        INSERT INTO venta
          (fecha_venta, descuento_venta, metodo_pago, estado_venta, id_cliente, id_empleado)
        VALUES
          (CURRENT_DATE, $1, $2, 'completada', $3, NULL)
        RETURNING id_venta, fecha_venta, metodo_pago, estado_venta
        `,
        [descuentoVenta, dto.metodoPago, idCliente],
      );
      const venta = ventaResult.rows[0];

      const itemsResultResponse: {
        idProducto: number;
        titulo: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const precioUnitario = Number(item.precio_unitario_snapshot);
        const subtotal = this.roundMoney(item.cantidad * precioUnitario);

        await client.query(
          `
          INSERT INTO detalle_venta
            (id_venta, id_producto, cantidad_vendida, precio_unitario_venta, descuento_detalle)
          VALUES
            ($1, $2, $3, $4, 0)
          `,
          [venta.id_venta, item.id_producto, item.cantidad, precioUnitario],
        );

        const stockUpdate = await client.query(
          `
          UPDATE producto
          SET stock_actual = stock_actual - $1
          WHERE id_producto = $2
            AND stock_actual >= $1
          `,
          [item.cantidad, item.id_producto],
        );

        if (stockUpdate.rowCount === 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.titulo_producto}" al confirmar la compra. ` +
              `Otro pedido lo reservó al mismo tiempo. Inténtalo de nuevo.`,
          );
        }

        itemsResultResponse.push({
          idProducto: item.id_producto,
          titulo: item.titulo_producto,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal,
        });
      }

      await client.query(
        `
        UPDATE carrito
        SET estado_carrito = 'convertido',
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_carrito = $1
        `,
        [idCarrito],
      );

      const totalNeto = this.roundMoney(totalBruto - descuentoVenta);
      const iva12 = this.roundMoney(totalNeto * 0.12);
      const total = this.roundMoney(totalNeto * 1.12);

      await client.query('COMMIT');

      return {
        message: 'Checkout realizado exitosamente',
        venta: {
          idVenta: venta.id_venta,
          fechaVenta: venta.fecha_venta,
          estadoVenta: venta.estado_venta,
          metodoPago: venta.metodo_pago,
          idCliente,
          items: itemsResultResponse,
          recibo: {
            subtotal: this.roundMoney(totalBruto),
            descuentoVenta,
            totalNeto,
            iva12,
            total,
          },
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

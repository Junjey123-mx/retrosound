import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helper: resuelve id_cliente desde id_usuario del token ────────────────
  // Mismo patrón que carrito.service.ts.
  // CurrentUser devuelve { id: id_usuario, correo, rol }.
  private async resolveIdCliente(idUsuario: number): Promise<number> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { idCliente: true },
    });
    if (!usuario || usuario.idCliente === null) {
      throw new ForbiddenException(
        'El usuario autenticado no tiene un perfil de cliente asociado',
      );
    }
    return usuario.idCliente;
  }

  // ── POST /checkout ────────────────────────────────────────────────────────
  // Convierte el carrito activo del cliente en una venta real.
  //
  // Flujo transaccional:
  //   BEGIN
  //     1. Validar productos (stock y estado) con SQL explícito
  //     2. INSERT venta  (id_empleado = NULL → venta online)
  //     3. Por cada item:
  //        a. INSERT detalle_venta
  //        b. UPDATE producto stock con condición anti-race-condition
  //     4. UPDATE carrito → estado = convertido
  //   COMMIT
  //
  // Si cualquier paso falla → ROLLBACK automático.
  // El stock NO se descuenta en carrito; solo aquí en checkout.
  async checkout(idUsuario: number, dto: CreateCheckoutDto) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    // Cargar carrito activo con items y datos básicos de producto
    const carrito = await this.prisma.carrito.findFirst({
      where: { idCliente, estado: 'activo' },
      include: {
        items: {
          include: {
            producto: { select: { id: true, titulo: true } },
          },
        },
      },
    });

    if (!carrito) {
      throw new NotFoundException(
        'No tienes un carrito activo para realizar el checkout',
      );
    }
    if (carrito.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    return this.prisma.$transaction(async (tx) => {

      // ── BEGIN ─────────────────────────────────────────────────────────────

      // 1. Validar stock real al momento del checkout (dentro de la transacción)
      //    Sigue el mismo patrón de SQL explícito que ventas.service.ts.
      for (const item of carrito.items) {
        const rows = await tx.$queryRaw<{
          id_producto: number;
          stock_actual: number;
          titulo_producto: string;
          estado_producto: string;
        }[]>`
          SELECT id_producto, stock_actual, titulo_producto, estado_producto
          FROM   producto
          WHERE  id_producto = ${item.idProducto}
        `;

        if (rows.length === 0) {
          throw new NotFoundException(
            `El producto con id ${item.idProducto} ya no existe`,
          );
        }

        const { stock_actual, titulo_producto, estado_producto } = rows[0];

        if (estado_producto === 'descontinuado' || estado_producto === 'inactivo') {
          throw new BadRequestException(
            `El producto "${titulo_producto}" ya no está disponible`,
          );
        }

        if (stock_actual < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${titulo_producto}": ` +
              `disponible=${stock_actual}, en carrito=${item.cantidad}`,
          );
        }
      }

      // 2. INSERT venta — SQL explícito (mismo estilo que ventas.service.ts)
      //    id_empleado = NULL: ventas online no tienen empleado asignado
      //    estado = completada: el pago online se considera inmediato
      const [venta] = await tx.$queryRaw<{
        id_venta: number;
        fecha_venta: Date;
        metodo_pago: string;
        estado_venta: string;
        descuento_venta: string;
      }[]>`
        INSERT INTO venta
          (fecha_venta, descuento_venta, metodo_pago, estado_venta, id_cliente, id_empleado)
        VALUES
          (
            CURRENT_DATE,
            ${dto.descuento ?? 0},
            ${dto.metodoPago},
            'completada'::"EstadoVenta",
            ${idCliente},
            NULL
          )
        RETURNING id_venta, fecha_venta, metodo_pago, estado_venta, descuento_venta
      `;

      // 3. INSERT detalle_venta + descuento de stock por cada item
      //    Usa precioUnitarioSnapshot: precio que el cliente vio al agregar al carrito
      let totalBruto = 0;
      const itemsResult: {
        idProducto: number;
        titulo: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }[] = [];

      for (const item of carrito.items) {
        const precioUnitario = Number(item.precioUnitarioSnapshot);
        const subtotal = Math.round(item.cantidad * precioUnitario * 100) / 100;
        totalBruto += subtotal;

        // INSERT detalle_venta — SQL explícito (mismo patrón que ventas.service.ts)
        await tx.$executeRaw`
          INSERT INTO detalle_venta
            (id_venta, id_producto, cantidad_vendida, precio_unitario_venta, descuento_detalle)
          VALUES
            (${venta.id_venta}, ${item.idProducto}, ${item.cantidad},
             ${precioUnitario}, 0)
        `;

        // UPDATE stock con condición anti-race-condition:
        // La condición "AND stock_actual >= cantidad" garantiza que si otro proceso
        // consumió el stock entre la validación de arriba y este UPDATE, la fila
        // no se actualiza y affected = 0 → excepción → ROLLBACK.
        const affected = await tx.$executeRaw`
          UPDATE producto
          SET    stock_actual = stock_actual - ${item.cantidad}
          WHERE  id_producto  = ${item.idProducto}
            AND  stock_actual >= ${item.cantidad}
        `;

        if (affected === 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.producto.titulo}" al confirmar la compra. ` +
              `Otro pedido lo reservó al mismo tiempo. Inténtalo de nuevo.`,
          );
        }

        itemsResult.push({
          idProducto: item.idProducto,
          titulo: item.producto.titulo,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal,
        });
      }

      // 4. Marcar carrito como convertido via Prisma ORM
      //    (usa @updatedAt para actualizar fecha_actualizacion automáticamente)
      await tx.carrito.update({
        where: { id: carrito.id },
        data: { estado: 'convertido' },
      });

      // 5. Calcular recibo con IVA 12% (Guatemala — mismo cálculo que ventas.service.ts)
      const descuentoVenta = Number(dto.descuento ?? 0);
      const totalNeto      = Math.round((totalBruto - descuentoVenta) * 100) / 100;
      const iva12          = Math.round(totalNeto * 0.12 * 100) / 100;
      const total          = Math.round(totalNeto * 1.12 * 100) / 100;

      // ── COMMIT ────────────────────────────────────────────────────────────
      return {
        message: 'Checkout realizado exitosamente',
        venta: {
          idVenta:     venta.id_venta,
          fechaVenta:  venta.fecha_venta,
          estadoVenta: venta.estado_venta,
          metodoPago:  venta.metodo_pago,
          idCliente,
          items: itemsResult,
          recibo: {
            subtotal:       Math.round(totalBruto * 100) / 100,
            descuentoVenta,
            totalNeto,
            iva12,
            total,
          },
        },
      };

      // ── ROLLBACK (cualquier excepción lanzada arriba revierte todo) ───────
    });
  }
}

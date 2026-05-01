import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.venta.findMany({
      include: {
        cliente: true,
        empleado: true,
        detalles: { include: { producto: true } },
      },
      orderBy: { fechaVenta: 'desc' },
    });
  }

  async findOne(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        cliente: true,
        empleado: true,
        detalles: { include: { producto: true } },
      },
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }

  // ── TRANSACCIÓN EXPLÍCITA ─────────────────────────────────────────────────
  // prisma.$transaction emite BEGIN al iniciar el callback.
  // Cualquier excepción lanzada dentro provoca ROLLBACK automático.
  // Si el callback completa sin error se emite COMMIT.
  // Todos los INSERT/UPDATE usan SQL explícito ($queryRaw / $executeRaw).
  async create(dto: CreateVentaDto) {
    return this.prisma.$transaction(async (tx) => {

      // ── BEGIN ─────────────────────────────────────────────────────────────

      // 1. Validar cliente activo ── ROLLBACK si no existe o está inactivo
      const clientes = await tx.$queryRaw<{ id_cliente: number }[]>`
        SELECT id_cliente
        FROM   cliente
        WHERE  id_cliente    = ${dto.idCliente}
          AND  estado_cliente = 'activo'::"EstadoGeneral"
      `;
      if (clientes.length === 0) {
        throw new NotFoundException(
          `Cliente ${dto.idCliente} no encontrado o inactivo`,
        );
      }

      // 2. Validar empleado activo ── ROLLBACK si no existe o está inactivo
      const empleados = await tx.$queryRaw<{ id_empleado: number }[]>`
        SELECT id_empleado
        FROM   empleado
        WHERE  id_empleado    = ${dto.idEmpleado}
          AND  estado_empleado = 'activo'::"EstadoGeneral"
      `;
      if (empleados.length === 0) {
        throw new NotFoundException(
          `Empleado ${dto.idEmpleado} no encontrado o inactivo`,
        );
      }

      // 3. Validar stock por cada producto ── ROLLBACK si insuficiente
      for (const detalle of dto.detalles) {
        if (detalle.cantidadVendida < 1) {
          throw new BadRequestException(
            `Cantidad inválida para producto ${detalle.idProducto}: debe ser >= 1`,
          );
        }

        const rows = await tx.$queryRaw<
          { id_producto: number; stock_actual: number; titulo_producto: string }[]
        >`
          SELECT id_producto, stock_actual, titulo_producto
          FROM   producto
          WHERE  id_producto    = ${detalle.idProducto}
            AND  estado_producto != 'descontinuado'::"EstadoProducto"
        `;

        if (rows.length === 0) {
          throw new NotFoundException(
            `Producto ${detalle.idProducto} no encontrado o descontinuado`,
          );
        }

        const { stock_actual, titulo_producto } = rows[0];
        if (stock_actual < detalle.cantidadVendida) {
          throw new BadRequestException(
            `Stock insuficiente para "${titulo_producto}": ` +
            `disponible=${stock_actual}, solicitado=${detalle.cantidadVendida}`,
          );
        }
      }

      // 4. INSERT venta ── SQL explícito, estado inicial = pendiente
      const [venta] = await tx.$queryRaw<
        {
          id_venta:       number;
          fecha_venta:    Date;
          metodo_pago:    string;
          estado_venta:   string;
          descuento_venta: string;
        }[]
      >`
        INSERT INTO venta
          (fecha_venta, descuento_venta, metodo_pago, estado_venta, id_cliente, id_empleado)
        VALUES
          (
            ${new Date(dto.fechaVenta)}::DATE,
            ${dto.descuento ?? 0},
            ${dto.metodoPago},
            'pendiente'::"EstadoVenta",
            ${dto.idCliente},
            ${dto.idEmpleado}
          )
        RETURNING id_venta, fecha_venta, metodo_pago, estado_venta, descuento_venta
      `;

      // 5. INSERT detalle_venta + UPDATE stock por cada ítem
      let totalBruto = 0;
      const detallesResult: {
        idProducto:      number;
        cantidadVendida: number;
        precioUnitario:  number;
        descuentoDetalle: number;
        subtotal:        number;
      }[] = [];

      for (const detalle of dto.detalles) {
        const descuento = detalle.descuentoDetalle ?? 0;
        const subtotal  = detalle.cantidadVendida * detalle.precioUnitario - descuento;
        totalBruto     += subtotal;

        // INSERT detalle_venta ── SQL explícito
        await tx.$executeRaw`
          INSERT INTO detalle_venta
            (id_venta, id_producto, cantidad_vendida, precio_unitario_venta, descuento_detalle)
          VALUES
            (${venta.id_venta}, ${detalle.idProducto}, ${detalle.cantidadVendida},
             ${detalle.precioUnitario}, ${descuento})
        `;

        // UPDATE producto: descontar stock vendido ── SQL explícito
        await tx.$executeRaw`
          UPDATE producto
          SET    stock_actual = stock_actual - ${detalle.cantidadVendida}
          WHERE  id_producto  = ${detalle.idProducto}
        `;

        detallesResult.push({
          idProducto:       detalle.idProducto,
          cantidadVendida:  detalle.cantidadVendida,
          precioUnitario:   detalle.precioUnitario,
          descuentoDetalle: descuento,
          subtotal:         Math.round(subtotal * 100) / 100,
        });
      }

      // 6. Calcular recibo con IVA 12% (Guatemala)
      const descuentoVenta = Number(dto.descuento ?? 0);
      const totalNeto      = Math.round((totalBruto - descuentoVenta) * 100) / 100;
      const iva12          = Math.round(totalNeto * 0.12 * 100) / 100;
      const total          = Math.round(totalNeto * 1.12 * 100) / 100;

      // ── COMMIT ────────────────────────────────────────────────────────────
      return {
        venta: {
          idVenta:    venta.id_venta,
          fechaVenta: venta.fecha_venta,
          metodoPago: venta.metodo_pago,
          estadoVenta: venta.estado_venta,
          idCliente:  dto.idCliente,
          idEmpleado: dto.idEmpleado,
        },
        detalles: detallesResult,
        recibo: {
          totalBruto:     Math.round(totalBruto * 100) / 100,
          descuentoVenta,
          totalNeto,
          iva12,
          total,
        },
      };

      // ── ROLLBACK (cualquier excepción lanzada arriba revierte todo) ───────
    });
  }
}

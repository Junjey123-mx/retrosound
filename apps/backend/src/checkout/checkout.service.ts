import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

const INCLUDE_VENTA_CHECKOUT = {
  cliente: {
    select: {
      idCliente: true,
      nombreCliente: true,
      apellidoCliente: true,
      correoCliente: true,
    },
  },
  detalles: {
    include: {
      producto: {
        select: {
          idProducto: true,
          tituloProducto: true,
          codigoSku: true,
        },
      },
    },
  },
} satisfies Prisma.VentaInclude;

type VentaConDetalles = Prisma.VentaGetPayload<{
  include: typeof INCLUDE_VENTA_CHECKOUT;
}>;

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(idCliente: number | null, dto: CreateCheckoutDto) {
    if (!idCliente) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un perfil de cliente asociado',
      );
    }

    // sp_checkout_carrito(p_id_cliente, p_metodo_pago, OUT p_id_venta_generada)
    // The SP resolves the active cart internally, validates stock, creates venta,
    // inserts detalles using precio_unitario_snapshot, and marks cart as 'convertido'.
    const spResult = await this.prisma
      .$queryRaw<Array<{ p_id_venta_generada: number }>>`
        CALL sp_checkout_carrito(
          ${idCliente}::integer,
          ${dto.metodoPago}::varchar,
          NULL::integer
        )
      `
      .catch((err: unknown) => this.mapSpError(err));

    const idVenta = Number(spResult[0].p_id_venta_generada);

    const venta = await this.prisma.venta.findUnique({
      where: { idVenta },
      include: INCLUDE_VENTA_CHECKOUT,
    });

    if (!venta) {
      throw new NotFoundException('No se pudo recuperar la venta creada');
    }

    return this.buildResponse(venta);
  }

  private mapSpError(error: unknown): never {
    let msg = '';
    if (error instanceof Error) {
      msg = error.message.toLowerCase();
      const meta = (error as { meta?: { message?: string } }).meta;
      if (meta?.message) msg += ' ' + meta.message.toLowerCase();
    }

    if (msg.includes('client') && msg.includes('does not exist')) {
      throw new NotFoundException('Cliente no encontrado');
    }
    if (msg.includes('no active cart')) {
      throw new NotFoundException(
        'No tienes un carrito activo para realizar el checkout',
      );
    }
    if (msg.includes('cart') && msg.includes('is empty')) {
      throw new BadRequestException('El carrito está vacío');
    }
    if (msg.includes('product') && msg.includes('does not exist')) {
      throw new NotFoundException(
        'Uno o más productos del carrito ya no están disponibles',
      );
    }
    if (msg.includes('insufficient stock')) {
      throw new ConflictException(
        'Stock insuficiente para uno o más productos del carrito',
      );
    }

    throw new BadRequestException(
      'Error al procesar el checkout. Verifique su carrito e intente nuevamente.',
    );
  }

  private buildResponse(venta: VentaConDetalles) {
    const subtotal = this.roundMoney(
      venta.detalles.reduce(
        (acc, d) =>
          acc +
          Number(d.cantidadVendida) * Number(d.precioUnitarioVenta) -
          Number(d.descuentoDetalle),
        0,
      ),
    );
    const descuento = Number(venta.descuentoVenta);
    const totalNeto = this.roundMoney(subtotal - descuento);
    const iva12 = this.roundMoney(totalNeto * 0.12);
    const total = this.roundMoney(totalNeto * 1.12);

    return {
      mensaje: 'Checkout realizado exitosamente',
      idVenta: venta.idVenta,
      fecha: venta.fechaVenta,
      metodoPago: venta.metodoPago,
      estado: venta.estadoVenta,
      cliente: venta.cliente
        ? {
            id: venta.cliente.idCliente,
            nombre: `${venta.cliente.nombreCliente} ${venta.cliente.apellidoCliente}`,
            correo: venta.cliente.correoCliente,
          }
        : null,
      items: venta.detalles.map((d) => ({
        idProducto: d.idProducto,
        titulo: d.producto.tituloProducto,
        sku: d.producto.codigoSku,
        cantidad: d.cantidadVendida,
        precioUnitario: Number(d.precioUnitarioVenta),
        descuento: Number(d.descuentoDetalle),
        subtotal: this.roundMoney(
          Number(d.cantidadVendida) * Number(d.precioUnitarioVenta) -
            Number(d.descuentoDetalle),
        ),
      })),
      recibo: {
        subtotal,
        descuento,
        totalNeto,
        iva12,
        total,
      },
    };
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

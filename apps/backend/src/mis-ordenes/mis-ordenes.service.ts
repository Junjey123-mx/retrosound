import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const productoSelect = {
  id: true,
  titulo: true,
  codigoSku: true,
  formato: { select: { nombre: true } },
  categoria: { select: { nombre: true } },
  artistas: { select: { artista: { select: { nombre: true } } } },
  generos: { select: { generoMusical: { select: { nombre: true } } } },
} as const;

@Injectable()
export class MisOrdenesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findByUsuario(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const ventas = await this.prisma.venta.findMany({
      where: { idCliente },
      include: {
        detalles: {
          include: {
            producto: { select: productoSelect },
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: [{ fechaVenta: 'desc' }, { id: 'desc' }],
    });

    return ventas.map((venta) => {
      const items = venta.detalles.map((detalle) => {
        const precioUnitario = Number(detalle.precioUnitario);
        const descuentoDetalle = Number(detalle.descuentoDetalle);
        const subtotalLinea = this.roundMoney(
          detalle.cantidadVendida * precioUnitario,
        );
        const totalLinea = this.roundMoney(subtotalLinea - descuentoDetalle);

        return {
          idDetalleVenta: detalle.id,
          idProducto: detalle.producto.id,
          tituloProducto: detalle.producto.titulo,
          codigoSku: detalle.producto.codigoSku,
          formato: detalle.producto.formato.nombre,
          categoria: detalle.producto.categoria.nombre,
          artistas: detalle.producto.artistas.map((pa) => pa.artista.nombre),
          generos: detalle.producto.generos.map((pg) => pg.generoMusical.nombre),
          cantidad: detalle.cantidadVendida,
          precioUnitario,
          descuentoDetalle,
          subtotalLinea,
          totalLinea,
        };
      });

      const subtotal = this.roundMoney(
        items.reduce((acc, item) => acc + item.subtotalLinea, 0),
      );
      const descuentoVenta = Number(venta.descuento);
      const totalNeto = this.roundMoney(subtotal - descuentoVenta);
      const iva12 = this.roundMoney(totalNeto * 0.12);
      const total = this.roundMoney(totalNeto * 1.12);

      return {
        idVenta: venta.id,
        fechaVenta: venta.fechaVenta,
        estadoVenta: venta.estado,
        metodoPago: venta.metodoPago,
        descuentoVenta,
        subtotal,
        descuento: descuentoVenta,
        totalNeto,
        iva12,
        total,
        items,
      };
    });
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

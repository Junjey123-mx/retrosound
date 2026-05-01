import { Injectable, NotFoundException } from '@nestjs/common';
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

  create(dto: CreateVentaDto) {
    return this.prisma.venta.create({
      data: {
        fechaVenta: new Date(dto.fechaVenta),
        descuento: dto.descuento ?? 0,
        metodoPago: dto.metodoPago,
        idCliente: dto.idCliente,
        idEmpleado: dto.idEmpleado,
        detalles: {
          create: dto.detalles.map((d) => ({
            idProducto: d.idProducto,
            cantidadVendida: d.cantidadVendida,
            precioUnitario: d.precioUnitario,
            descuentoDetalle: d.descuentoDetalle ?? 0,
          })),
        },
      },
    });
  }
}

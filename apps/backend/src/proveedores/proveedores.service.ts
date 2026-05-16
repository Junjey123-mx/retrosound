import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

const INCLUDE_DETAIL = {
  productosProveedor: {
    include: {
      producto: { include: { categoria: true, formato: true } },
    },
  },
  comprasProveedor: {
    orderBy: { fechaCompraProveedor: 'desc' as const },
    include: {
      detalles: { include: { producto: true } },
    },
  },
} satisfies Prisma.ProveedorInclude;

type ProveedorConRelaciones = Prisma.ProveedorGetPayload<{
  include: typeof INCLUDE_DETAIL;
}>;

type ProveedorBase = Prisma.ProveedorGetPayload<{ select: {
  idProveedor: true;
  nombreProveedor: true;
  telefonoProveedor: true;
  correoProveedor: true;
  direccionProveedor: true;
  nombreContactoProveedor: true;
  estadoProveedor: true;
  fechaInactivacion: true;
} }>;

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const proveedores = await this.prisma.proveedor.findMany({
      orderBy: { nombreProveedor: 'asc' },
    });
    return proveedores.map((p) => this.mapProveedor(p));
  }

  // Not exposed by controller; ready for a future GET /proveedores/stats endpoint.
  async stats() {
    const [total, activos, inactivos, productosAsociados, entregasPendientes] =
      await Promise.all([
        this.prisma.proveedor.count(),
        this.prisma.proveedor.count({ where: { estadoProveedor: 'activo' } }),
        this.prisma.proveedor.count({ where: { estadoProveedor: { not: 'activo' } } }),
        this.prisma.productoProveedor.count(),
        this.prisma.compraProveedor.count({ where: { estadoCompra: 'pendiente' } }),
      ]);
    return { total, activos, inactivos, productosAsociados, entregasPendientes };
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { idProveedor: id },
      include: INCLUDE_DETAIL,
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return this.mapProveedorDetalle(proveedor);
  }

  async create(dto: CreateProveedorDto) {
    const proveedor = await this.prisma.proveedor.create({
      data: {
        nombreProveedor: dto.nombre,
        telefonoProveedor: dto.telefono ?? null,
        correoProveedor: dto.correo ?? null,
        direccionProveedor: dto.direccion ?? null,
        nombreContactoProveedor: dto.nombreContacto ?? null,
      },
    });
    return this.mapProveedor(proveedor);
  }

  async update(id: number, dto: Partial<CreateProveedorDto>) {
    await this.findOne(id);

    const data: Prisma.ProveedorUpdateInput = {};
    if (dto.nombre !== undefined) data.nombreProveedor = dto.nombre;
    if (dto.telefono !== undefined) data.telefonoProveedor = dto.telefono;
    if (dto.correo !== undefined) data.correoProveedor = dto.correo;
    if (dto.direccion !== undefined) data.direccionProveedor = dto.direccion;
    if (dto.nombreContacto !== undefined) data.nombreContactoProveedor = dto.nombreContacto;

    if (Object.keys(data).length === 0) return this.findOne(id);

    const proveedor = await this.prisma.proveedor.update({
      where: { idProveedor: id },
      data,
    });
    return this.mapProveedor(proveedor);
  }

  // Not exposed by controller; ready for a future PATCH /proveedores/:id/status endpoint.
  async updateStatus(id: number, estado: string) {
    await this.findOne(id);
    const proveedor = await this.prisma.proveedor.update({
      where: { idProveedor: id },
      data: {
        estadoProveedor: estado,
        fechaInactivacion: estado === 'inactivo' ? new Date() : null,
      },
    });
    return this.mapProveedor(proveedor);
  }

  // Not exposed by controller; ready for a future GET /proveedores/:id/productos endpoint.
  async findProductosByProveedor(id: number) {
    await this.findOne(id);
    const relaciones = await this.prisma.productoProveedor.findMany({
      where: { idProveedor: id },
      include: {
        producto: { include: { categoria: true, formato: true } },
      },
    });
    return relaciones.map((r) => ({
      esProveedorPrincipal: r.esProveedorPrincipal,
      producto: {
        id: r.producto.idProducto,
        titulo: r.producto.tituloProducto,
        sku: r.producto.codigoSku,
        formato: r.producto.formato.nombreFormato,
        categoria: r.producto.categoria.nombreCategoria,
        stock: r.producto.stockActual,
        imagenUrl: r.producto.imagenUrl,
        estado: r.producto.estadoProducto,
      },
    }));
  }

  // Not exposed by controller; ready for a future GET /proveedores/:id/entregas endpoint.
  async findEntregasByProveedor(id: number) {
    await this.findOne(id);
    const compras = await this.prisma.compraProveedor.findMany({
      where: { idProveedor: id },
      orderBy: { fechaCompraProveedor: 'desc' },
      include: {
        detalles: { include: { producto: true } },
      },
    });
    return compras.map((c) => ({
      id: c.idCompraProveedor,
      fecha: c.fechaCompraProveedor,
      estadoCompra: c.estadoCompra,
      detalles: c.detalles.map((d) => ({
        producto: {
          id: d.producto.idProducto,
          titulo: d.producto.tituloProducto,
          sku: d.producto.codigoSku,
        },
        cantidadComprada: d.cantidadComprada,
        cantidadRecibida: d.cantidadRecibida,
        costoUnitario: Number(d.costoUnitarioCompra),
      })),
    }));
  }

  async remove(id: number) {
    await this.findOne(id);
    const proveedor = await this.prisma.proveedor.update({
      where: { idProveedor: id },
      data: {
        estadoProveedor: 'inactivo',
        fechaInactivacion: new Date(),
      },
    });
    return this.mapProveedor(proveedor);
  }

  private mapProveedor(p: ProveedorBase) {
    return {
      id: p.idProveedor,
      nombre: p.nombreProveedor,
      telefono: p.telefonoProveedor,
      correo: p.correoProveedor,
      direccion: p.direccionProveedor,
      nombreContacto: p.nombreContactoProveedor,
      estado: p.estadoProveedor,
      fechaInactivacion: p.fechaInactivacion,
    };
  }

  private mapProveedorDetalle(p: ProveedorConRelaciones) {
    return {
      ...this.mapProveedor(p),
      productos: p.productosProveedor.map((pp) => ({
        esProveedorPrincipal: pp.esProveedorPrincipal,
        producto: {
          id: pp.producto.idProducto,
          titulo: pp.producto.tituloProducto,
          sku: pp.producto.codigoSku,
          formato: pp.producto.formato.nombreFormato,
          categoria: pp.producto.categoria.nombreCategoria,
          stock: pp.producto.stockActual,
          imagenUrl: pp.producto.imagenUrl,
          estado: pp.producto.estadoProducto,
        },
      })),
      compras: p.comprasProveedor.map((c) => ({
        id: c.idCompraProveedor,
        fecha: c.fechaCompraProveedor,
        estadoCompra: c.estadoCompra,
        detalles: c.detalles.map((d) => ({
          producto: {
            id: d.producto.idProducto,
            titulo: d.producto.tituloProducto,
            sku: d.producto.codigoSku,
          },
          cantidadComprada: d.cantidadComprada,
          cantidadRecibida: d.cantidadRecibida,
          costoUnitario: Number(d.costoUnitarioCompra),
        })),
      })),
    };
  }
}

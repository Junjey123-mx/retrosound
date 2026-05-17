import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';
import { UpdateProductoImagenDto } from '../productos/dto/update-producto-imagen.dto';
import { FindProveedorProductosDto } from './dto/find-proveedor-productos.dto';
import { FindProveedorEntregasDto } from './dto/find-proveedor-entregas.dto';
import { UpdateProveedorProductoDto } from './dto/update-proveedor-producto.dto';
import { UpdateProveedorPerfilDto } from './dto/update-proveedor-perfil.dto';

const INCLUDE_ENTREGA = {
  detalles: {
    include: {
      producto: {
        select: { idProducto: true, tituloProducto: true, codigoSku: true },
      },
    },
  },
} satisfies Prisma.CompraProveedorInclude;

type EntregaConDetalles = Prisma.CompraProveedorGetPayload<{
  include: typeof INCLUDE_ENTREGA;
}>;

@Injectable()
export class ProveedorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(idProveedor: number | null) {
    this.requireProveedorId(idProveedor);
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { idProveedor },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return this.mapProveedor(proveedor);
  }

  async getDashboard(idProveedor: number | null) {
    this.requireProveedorId(idProveedor);
    const [totalProductos, totalEntregas, entregasPendientes] =
      await Promise.all([
        this.prisma.productoProveedor.count({ where: { idProveedor } }),
        this.prisma.compraProveedor.count({ where: { idProveedor } }),
        this.prisma.compraProveedor.count({
          where: { idProveedor, estadoCompra: 'pendiente' },
        }),
      ]);
    return { totalProductos, totalEntregas, entregasPendientes };
  }

  async getProductos(
    idProveedor: number | null,
    dto: FindProveedorProductosDto,
  ) {
    this.requireProveedorId(idProveedor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductoWhereInput = {
      productosProveedor: { some: { idProveedor } },
      ...(dto.estado ? { estadoProducto: dto.estado } : {}),
      ...(dto.search
        ? {
            OR: [
              {
                tituloProducto: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                codigoSku: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        select: {
          idProducto: true,
          tituloProducto: true,
          descripcionProducto: true,
          estadoProducto: true,
          codigoSku: true,
          precioVenta: true,
          stockActual: true,
          stockMinimo: true,
          imagenUrl: true,
        },
        skip,
        take: limit,
        orderBy: { tituloProducto: 'asc' },
      }),
    ]);

    return {
      data: items.map((p) => ({ ...p, precioVenta: Number(p.precioVenta) })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProducto(idProveedor: number | null, idProducto: number) {
    this.requireProveedorId(idProveedor);
    await this.assertProductoBelongsToProveedor(idProducto, idProveedor);
    const producto = await this.prisma.producto.findUnique({
      where: { idProducto },
      select: {
        idProducto: true,
        tituloProducto: true,
        descripcionProducto: true,
        estadoProducto: true,
        codigoSku: true,
        precioVenta: true,
        stockActual: true,
        stockMinimo: true,
        imagenUrl: true,
        anioLanzamiento: true,
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return { ...producto, precioVenta: Number(producto.precioVenta) };
  }

  async updateProducto(
    idProveedor: number | null,
    idProducto: number,
    dto: UpdateProveedorProductoDto,
  ) {
    this.requireProveedorId(idProveedor);
    await this.assertProductoBelongsToProveedor(idProducto, idProveedor);
    const producto = await this.prisma.producto.update({
      where: { idProducto },
      data: { descripcionProducto: dto.descripcion },
      select: {
        idProducto: true,
        tituloProducto: true,
        descripcionProducto: true,
        codigoSku: true,
      },
    });
    return { ...producto, mensaje: 'Producto actualizado correctamente' };
  }

  async getEntregas(idProveedor: number | null, dto: FindProveedorEntregasDto) {
    this.requireProveedorId(idProveedor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CompraProveedorWhereInput = {
      idProveedor,
      ...(dto.estado ? { estadoCompra: dto.estado } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.compraProveedor.count({ where }),
      this.prisma.compraProveedor.findMany({
        where,
        include: INCLUDE_ENTREGA,
        skip,
        take: limit,
        orderBy: { fechaCompraProveedor: 'desc' },
      }),
    ]);

    return {
      data: items.map((e) => this.mapEntrega(e)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEntrega(idProveedor: number | null, idCompra: number) {
    this.requireProveedorId(idProveedor);
    const entrega = await this.assertEntregaBelongsToProveedor(
      idCompra,
      idProveedor,
    );
    return this.mapEntrega(entrega);
  }

  async getPerfil(idProveedor: number | null) {
    this.requireProveedorId(idProveedor);
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { idProveedor },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return this.mapProveedor(proveedor);
  }

  async updatePerfil(
    idProveedor: number | null,
    dto: UpdateProveedorPerfilDto,
  ) {
    this.requireProveedorId(idProveedor);
    const existe = await this.prisma.proveedor.findUnique({
      where: { idProveedor },
    });
    if (!existe) throw new NotFoundException('Proveedor no encontrado');

    const updated = await this.prisma.proveedor.update({
      where: { idProveedor },
      data: {
        ...(dto.nombreProveedor !== undefined
          ? { nombreProveedor: dto.nombreProveedor }
          : {}),
        ...(dto.telefonoProveedor !== undefined
          ? { telefonoProveedor: dto.telefonoProveedor }
          : {}),
        ...(dto.correoProveedor !== undefined
          ? { correoProveedor: dto.correoProveedor }
          : {}),
        ...(dto.direccionProveedor !== undefined
          ? { direccionProveedor: dto.direccionProveedor }
          : {}),
        ...(dto.nombreContacto !== undefined
          ? { nombreContactoProveedor: dto.nombreContacto }
          : {}),
      },
    });
    return { ...this.mapProveedor(updated), mensaje: 'Perfil actualizado correctamente' };
  }

  async registrarEntrega(
    dto: RegistrarEntregaProveedorDto,
    idProveedor: number | null,
  ) {
    this.requireProveedorId(idProveedor);

    const relacion = await this.prisma.productoProveedor.findUnique({
      where: {
        idProducto_idProveedor: { idProducto: dto.idProducto, idProveedor },
      },
      include: {
        producto: {
          select: {
            idProducto: true,
            tituloProducto: true,
            codigoSku: true,
          },
        },
      },
    });

    if (!relacion) {
      throw new ForbiddenException(
        `El producto ${dto.idProducto} no está asociado a su cuenta de proveedor`,
      );
    }

    const [row] = await this.prisma.$queryRaw<
      Array<{ p_id_compra_generada: number }>
    >`
      CALL sp_registrar_entrega_proveedor(
        ${idProveedor}::integer,
        ${dto.idProducto}::integer,
        ${dto.cantidadReportada}::integer,
        ${dto.costoUnitario}::numeric,
        NULL::integer
      )
    `;

    return {
      idCompra: Number(row.p_id_compra_generada),
      estado: 'pendiente',
      producto: {
        id: relacion.producto.idProducto,
        titulo: relacion.producto.tituloProducto,
        sku: relacion.producto.codigoSku,
      },
      cantidadReportada: dto.cantidadReportada,
      costoUnitario: dto.costoUnitario,
    };
  }

  async updateProductoImagen(
    idProducto: number,
    dto: UpdateProductoImagenDto,
    idProveedor: number | null,
  ) {
    this.requireProveedorId(idProveedor);
    await this.assertProductoBelongsToProveedor(idProducto, idProveedor);

    await this.prisma
      .$queryRaw<Array<{ p_actualizado: boolean }>>`
        CALL sp_actualizar_imagen_producto(
          ${idProducto}::integer,
          ${dto.imagenUrl}::text,
          ${dto.imagenPublicId}::varchar,
          ${idProveedor}::integer,
          NULL::boolean
        )
      `
      .catch((err: unknown) => this.mapImagenSpError(err));

    const producto = await this.prisma.producto.findUnique({
      where: { idProducto },
      select: {
        idProducto: true,
        tituloProducto: true,
        imagenUrl: true,
        imagenPublicId: true,
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');

    return {
      idProducto: producto.idProducto,
      titulo: producto.tituloProducto,
      imagenUrl: producto.imagenUrl,
      imagenPublicId: producto.imagenPublicId,
      mensaje: 'Imagen actualizada correctamente',
    };
  }

  private requireProveedorId(
    idProveedor: number | null,
  ): asserts idProveedor is number {
    if (!idProveedor) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un proveedor asociado',
      );
    }
  }

  private async assertProductoBelongsToProveedor(
    idProducto: number,
    idProveedor: number,
  ) {
    const relacion = await this.prisma.productoProveedor.findUnique({
      where: { idProducto_idProveedor: { idProducto, idProveedor } },
      select: { idProducto: true },
    });
    if (!relacion) {
      throw new ForbiddenException(
        `El producto ${idProducto} no está asociado a su cuenta de proveedor`,
      );
    }
  }

  private async assertEntregaBelongsToProveedor(
    idCompra: number,
    idProveedor: number,
  ): Promise<EntregaConDetalles> {
    const entrega = await this.prisma.compraProveedor.findUnique({
      where: { idCompraProveedor: idCompra },
      include: INCLUDE_ENTREGA,
    });
    if (!entrega) throw new NotFoundException('Entrega no encontrada');
    if (entrega.idProveedor !== idProveedor) {
      throw new ForbiddenException('No tiene acceso a esta entrega');
    }
    return entrega;
  }

  private mapProveedor(p: {
    idProveedor: number;
    nombreProveedor: string;
    telefonoProveedor: string | null;
    correoProveedor: string | null;
    direccionProveedor: string | null;
    nombreContactoProveedor: string | null;
    estadoProveedor: string;
  }) {
    return {
      idProveedor: p.idProveedor,
      nombre: p.nombreProveedor,
      telefono: p.telefonoProveedor,
      correo: p.correoProveedor,
      direccion: p.direccionProveedor,
      nombreContacto: p.nombreContactoProveedor,
      estado: p.estadoProveedor,
    };
  }

  private mapEntrega(e: EntregaConDetalles) {
    return {
      idCompra: e.idCompraProveedor,
      fecha: e.fechaCompraProveedor,
      estado: e.estadoCompra,
      detalles: e.detalles.map((d) => ({
        idDetalle: d.idDetalleCompraProveedor,
        producto: {
          id: d.producto.idProducto,
          titulo: d.producto.tituloProducto,
          sku: d.producto.codigoSku,
        },
        cantidadComprada: d.cantidadComprada,
        costoUnitario: Number(d.costoUnitarioCompra),
      })),
    };
  }

  private mapImagenSpError(error: unknown): never {
    let msg = '';
    if (error instanceof Error) {
      msg = error.message.toLowerCase();
      const meta = (error as { meta?: { message?: string } }).meta;
      if (meta?.message) msg += ' ' + meta.message.toLowerCase();
    }
    if (msg.includes('product') && msg.includes('does not exist')) {
      throw new NotFoundException('Producto no encontrado');
    }
    if (msg.includes('imagen_url') || msg.includes('imagen_public_id')) {
      throw new BadRequestException(
        'La URL o ID público de la imagen no puede estar vacío',
      );
    }
    if (msg.includes('supplier') && msg.includes('does not exist')) {
      throw new BadRequestException('El proveedor no existe en el sistema');
    }
    if (msg.includes('no ownership')) {
      throw new ForbiddenException(
        'El proveedor no tiene permisos sobre este producto',
      );
    }
    throw new BadRequestException(
      'Error al actualizar la imagen. Verifique los datos e intente nuevamente.',
    );
  }
}

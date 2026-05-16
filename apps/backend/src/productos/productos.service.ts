import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

const INCLUDE_RELACIONES = {
  categoria: true,
  formato: true,
  productosArtista: { include: { artista: true } },
  productosGenero: { include: { generoMusical: true } },
} satisfies Prisma.ProductoInclude;

type ProductoConRelaciones = Prisma.ProductoGetPayload<{
  include: typeof INCLUDE_RELACIONES;
}>;

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const productos = await this.prisma.producto.findMany({
      where: { estadoProducto: { not: 'descontinuado' } },
      include: INCLUDE_RELACIONES,
      orderBy: { idProducto: 'asc' },
    });
    return productos.map((p) => this.mapProducto(p));
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { idProducto: id },
      include: INCLUDE_RELACIONES,
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return this.mapProducto(producto);
  }

  async create(dto: CreateProductoDto) {
    try {
      const producto = await this.prisma.producto.create({
        data: {
          tituloProducto: dto.titulo,
          descripcionProducto: dto.descripcion ?? null,
          anioLanzamiento: dto.anioLanzamiento ?? null,
          precioVenta: dto.precioVenta,
          stockActual: dto.stockActual,
          stockMinimo: dto.stockMinimo,
          codigoSku: dto.codigoSku,
          categoria: { connect: { idCategoria: dto.idCategoria } },
          formato: { connect: { idFormato: dto.idFormato } },
          productosArtista: dto.artistaIds !== undefined
            ? { create: dto.artistaIds.map((id) => ({ idArtista: id })) }
            : undefined,
          productosGenero: dto.generoIds !== undefined
            ? { create: dto.generoIds.map((id) => ({ idGeneroMusical: id })) }
            : undefined,
        },
        include: INCLUDE_RELACIONES,
      });
      return this.mapProducto(producto);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, dto: Partial<CreateProductoDto>) {
    await this.findOne(id);

    try {
      const data: Prisma.ProductoUpdateInput = {};

      if (dto.titulo !== undefined) data.tituloProducto = dto.titulo;
      if (dto.descripcion !== undefined) data.descripcionProducto = dto.descripcion;
      if (dto.anioLanzamiento !== undefined) data.anioLanzamiento = dto.anioLanzamiento;
      if (dto.precioVenta !== undefined) data.precioVenta = dto.precioVenta;
      if (dto.stockActual !== undefined) data.stockActual = dto.stockActual;
      if (dto.stockMinimo !== undefined) data.stockMinimo = dto.stockMinimo;
      if (dto.codigoSku !== undefined) data.codigoSku = dto.codigoSku;
      if (dto.idCategoria !== undefined) {
        data.categoria = { connect: { idCategoria: dto.idCategoria } };
      }
      if (dto.idFormato !== undefined) {
        data.formato = { connect: { idFormato: dto.idFormato } };
      }
      if (dto.artistaIds !== undefined) {
        data.productosArtista = {
          deleteMany: {},
          create: dto.artistaIds.map((aid) => ({ idArtista: aid })),
        };
      }
      if (dto.generoIds !== undefined) {
        data.productosGenero = {
          deleteMany: {},
          create: dto.generoIds.map((gid) => ({ idGeneroMusical: gid })),
        };
      }

      const producto = await this.prisma.producto.update({
        where: { idProducto: id },
        data,
        include: INCLUDE_RELACIONES,
      });
      return this.mapProducto(producto);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Not yet exposed by controller; ready for a future PATCH /productos/:id/status endpoint.
  async updateStatus(id: number, estado: string) {
    await this.findOne(id);
    const producto = await this.prisma.producto.update({
      where: { idProducto: id },
      data: {
        estadoProducto: estado,
        fechaInactivacion:
          estado === 'inactivo' || estado === 'descontinuado' ? new Date() : null,
      },
      include: INCLUDE_RELACIONES,
    });
    return this.mapProducto(producto);
  }

  // PATCH /productos/:id/imagen — admin and empleado_inventario only (p_id_proveedor = NULL).
  async updateImage(id: number, imagenUrl: string, imagenPublicId: string) {
    await this.findOne(id);

    // sp_actualizar_imagen_producto(p_id_producto, p_imagen_url, p_imagen_public_id,
    //   p_id_proveedor NULL = admin/inventory bypass, OUT p_actualizado)
    await this.prisma
      .$queryRaw<Array<{ p_actualizado: boolean }>>`
        CALL sp_actualizar_imagen_producto(
          ${id}::integer,
          ${imagenUrl}::text,
          ${imagenPublicId}::varchar,
          NULL::integer,
          NULL::boolean
        )
      `
      .catch((err: unknown) => this.mapImagenSpError(err));

    const producto = await this.prisma.producto.findUnique({
      where: { idProducto: id },
      select: {
        idProducto: true,
        tituloProducto: true,
        imagenUrl: true,
        imagenPublicId: true,
      },
    });

    return {
      idProducto: producto!.idProducto,
      titulo: producto!.tituloProducto,
      imagenUrl: producto!.imagenUrl,
      imagenPublicId: producto!.imagenPublicId,
      mensaje: 'Imagen actualizada correctamente',
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

  async remove(id: number) {
    await this.findOne(id);
    const producto = await this.prisma.producto.update({
      where: { idProducto: id },
      data: {
        estadoProducto: 'descontinuado',
        fechaInactivacion: new Date(),
      },
      include: INCLUDE_RELACIONES,
    });
    return this.mapProducto(producto);
  }

  private mapProducto(p: ProductoConRelaciones) {
    return {
      id: p.idProducto,
      titulo: p.tituloProducto,
      descripcion: p.descripcionProducto,
      anioLanzamiento: p.anioLanzamiento,
      precioVenta: Number(p.precioVenta),
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      codigoSku: p.codigoSku,
      estado: p.estadoProducto,
      fechaInactivacion: p.fechaInactivacion,
      imagenUrl: p.imagenUrl,
      imagenPublicId: p.imagenPublicId,
      idCategoria: p.idCategoria,
      idFormato: p.idFormato,
      categoria: {
        id: p.categoria.idCategoria,
        nombre: p.categoria.nombreCategoria,
        descripcion: p.categoria.descripcionCategoria,
        estado: p.categoria.estadoCategoria,
      },
      formato: {
        id: p.formato.idFormato,
        nombre: p.formato.nombreFormato,
        descripcion: p.formato.descripcionFormato,
        estado: p.formato.estadoFormato,
      },
      artistas: p.productosArtista.map((pa) => ({
        artista: {
          id: pa.artista.idArtista,
          nombre: pa.artista.nombreArtista,
          paisOrigen: pa.artista.paisOrigenArtista,
          anioInicio: pa.artista.anioInicioArtista,
          estado: pa.artista.estadoArtista,
        },
      })),
      generos: p.productosGenero.map((pg) => ({
        generoMusical: {
          id: pg.generoMusical.idGeneroMusical,
          nombre: pg.generoMusical.nombreGeneroMusical,
          descripcion: pg.generoMusical.descripcionGeneroMusical,
          estado: pg.generoMusical.estadoGeneroMusical,
        },
      })),
    };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException('El SKU ya existe');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Producto no encontrado');
      }
    }

    throw error;
  }
}

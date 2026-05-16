import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';
import { UpdateProductoImagenDto } from '../productos/dto/update-producto-imagen.dto';

@Injectable()
export class ProveedorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarEntrega(
    dto: RegistrarEntregaProveedorDto,
    idProveedor: number | null,
  ) {
    if (!idProveedor) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un proveedor asociado',
      );
    }

    // Validate ownership before reaching the SP, so we return a clean HTTP error.
    const relacion = await this.prisma.productoProveedor.findUnique({
      where: {
        idProducto_idProveedor: {
          idProducto: dto.idProducto,
          idProveedor,
        },
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

    // sp_registrar_entrega_proveedor(p_id_proveedor, p_id_producto,
    //   p_cantidad_reportada, p_costo_unitario, OUT p_id_compra_generada)
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
    if (!idProveedor) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un proveedor asociado',
      );
    }

    // Ownership check before SP for clean ForbiddenException
    const relacion = await this.prisma.productoProveedor.findUnique({
      where: { idProducto_idProveedor: { idProducto, idProveedor } },
      select: { idProducto: true },
    });
    if (!relacion) {
      throw new ForbiddenException(
        `El producto ${idProducto} no está asociado a su cuenta de proveedor`,
      );
    }

    // sp_actualizar_imagen_producto(p_id_producto, p_imagen_url, p_imagen_public_id,
    //   p_id_proveedor, OUT p_actualizado) — SP enforces ownership at DB level too
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

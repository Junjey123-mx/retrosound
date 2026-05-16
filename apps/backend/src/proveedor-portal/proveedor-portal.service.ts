import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';

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
}

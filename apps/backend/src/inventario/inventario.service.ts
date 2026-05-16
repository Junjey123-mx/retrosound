import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarRecepcionDto } from './dto/confirmar-recepcion.dto';
import { StockQueryDto } from './dto/stock-query.dto';

const INCLUDE_RECEPCION = {
  proveedor: { select: { idProveedor: true, nombreProveedor: true } },
  empleado: {
    select: {
      idEmpleado: true,
      nombreEmpleado: true,
      apellidoEmpleado: true,
    },
  },
  detalles: {
    include: {
      producto: {
        select: {
          idProducto: true,
          tituloProducto: true,
          codigoSku: true,
          stockActual: true,
          stockMinimo: true,
        },
      },
    },
  },
} satisfies Prisma.CompraProveedorInclude;

type CompraConDetalles = Prisma.CompraProveedorGetPayload<{
  include: typeof INCLUDE_RECEPCION;
}>;

type StockCriticoRow = {
  id_producto: number;
  titulo_producto: string;
  codigo_sku: string;
  stock_actual: number;
  stock_minimo: number;
  estado_producto: string;
  nombre_categoria: string;
  nombre_formato: string;
  proveedor_id: number | null;
  proveedor_nombre: string | null;
};

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecepciones(query: StockQueryDto = {}) {
    const { search, estado, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CompraProveedorWhereInput = {};
    if (estado) where.estadoCompra = estado;
    if (search) {
      where.proveedor = {
        nombreProveedor: { contains: search, mode: 'insensitive' },
      };
    }

    const [recepciones, total] = await Promise.all([
      this.prisma.compraProveedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCompraProveedor: 'desc' },
        include: INCLUDE_RECEPCION,
      }),
      this.prisma.compraProveedor.count({ where }),
    ]);

    return {
      data: recepciones.map((r) => this.mapRecepcion(r)),
      total,
      page,
      limit,
    };
  }

  async findRecepcionById(id: number) {
    const recepcion = await this.prisma.compraProveedor.findUnique({
      where: { idCompraProveedor: id },
      include: INCLUDE_RECEPCION,
    });

    if (!recepcion) throw new NotFoundException('Recepción no encontrada');
    return this.mapRecepcion(recepcion);
  }

  async confirmarRecepcion(
    idDetalle: number,
    dto: ConfirmarRecepcionDto,
    idEmpleado: number | null,
  ) {
    if (!idEmpleado) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un empleado asociado',
      );
    }

    const detalle = await this.prisma.detalleCompraProveedor.findUnique({
      where: { idDetalleCompraProveedor: idDetalle },
    });
    if (!detalle) throw new NotFoundException('Detalle de compra no encontrado');

    // sp_confirmar_recepcion_stock(p_id_detalle_compra, p_cantidad_recibida, p_id_empleado,
    //   OUT p_nuevo_stock, OUT p_estado_compra)
    const spResult = await this.prisma
      .$queryRaw<Array<{ p_nuevo_stock: number; p_estado_compra: string }>>`
        CALL sp_confirmar_recepcion_stock(
          ${idDetalle}::integer,
          ${dto.cantidadRecibida}::integer,
          ${idEmpleado}::integer,
          NULL::integer,
          NULL::varchar
        )
      `
      .catch((err: unknown) => this.mapSpError(err));

    const row = spResult[0];

    return {
      idDetalleCompra: idDetalle,
      cantidadRecibida: dto.cantidadRecibida,
      nuevoStock: Number(row.p_nuevo_stock),
      estadoCompra: row.p_estado_compra,
      mensaje: 'Recepción confirmada correctamente',
    };
  }

  async findStockCritico(query: StockQueryDto = {}) {
    const { search, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const searchSql = search
      ? Prisma.sql`AND (prod.titulo_producto ILIKE ${'%' + search + '%'}
           OR prod.codigo_sku ILIKE ${'%' + search + '%'})`
      : Prisma.sql``;

    const [rows, [{ total }]] = await Promise.all([
      this.prisma.$queryRaw<StockCriticoRow[]>`
        SELECT
          prod.id_producto,
          prod.titulo_producto,
          prod.codigo_sku,
          prod.stock_actual,
          prod.stock_minimo,
          prod.estado_producto,
          cat.nombre_categoria,
          f.nombre_formato,
          prov.id_proveedor     AS proveedor_id,
          prov.nombre_proveedor AS proveedor_nombre
        FROM producto prod
        JOIN categoria cat ON cat.id_categoria = prod.id_categoria
        JOIN formato   f   ON f.id_formato    = prod.id_formato
        LEFT JOIN producto_proveedor pp
          ON pp.id_producto = prod.id_producto
         AND pp.es_proveedor_principal = true
        LEFT JOIN proveedor prov ON prov.id_proveedor = pp.id_proveedor
        WHERE prod.stock_actual <= prod.stock_minimo
        ${searchSql}
        ORDER BY prod.stock_actual ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) AS total
        FROM producto
        WHERE stock_actual <= stock_minimo
      `,
    ]);

    return {
      data: rows.map((r) => ({
        id: Number(r.id_producto),
        titulo: r.titulo_producto,
        sku: r.codigo_sku,
        stockActual: Number(r.stock_actual),
        stockMinimo: Number(r.stock_minimo),
        estado: r.estado_producto,
        categoria: r.nombre_categoria,
        formato: r.nombre_formato,
        proveedorPrincipal: r.proveedor_id
          ? { id: Number(r.proveedor_id), nombre: r.proveedor_nombre }
          : null,
      })),
      total: Number(total),
      page,
      limit,
    };
  }

  async findStockResumen() {
    const [
      totalProductos,
      agotados,
      [{ stockCritico }],
      [{ stockSuficiente }],
      proveedoresDistintos,
    ] = await Promise.all([
      this.prisma.producto.count(),
      this.prisma.producto.count({ where: { estadoProducto: 'agotado' } }),
      this.prisma.$queryRaw<Array<{ stockCritico: bigint }>>`
        SELECT COUNT(*) AS "stockCritico"
        FROM producto
        WHERE stock_actual <= stock_minimo
      `,
      this.prisma.$queryRaw<Array<{ stockSuficiente: bigint }>>`
        SELECT COUNT(*) AS "stockSuficiente"
        FROM producto
        WHERE stock_actual > stock_minimo
      `,
      this.prisma.productoProveedor.groupBy({
        by: ['idProveedor'],
        where: { esProveedorPrincipal: true },
      }),
    ]);

    return {
      totalProductos,
      stockCritico: Number(stockCritico),
      agotados,
      stockSuficiente: Number(stockSuficiente),
      proveedoresPrincipales: proveedoresDistintos.length,
    };
  }

  private mapSpError(error: unknown): never {
    let msg = '';
    if (error instanceof Error) {
      msg = error.message.toLowerCase();
      // Prisma wraps raw-query failures; the original PG message lives in meta.message
      const meta = (error as { meta?: { message?: string } }).meta;
      if (meta?.message) msg += ' ' + meta.message.toLowerCase();
    }

    if (msg.includes('cantidad_recibida must be > 0')) {
      throw new BadRequestException('La cantidad recibida debe ser mayor a 0');
    }
    if (msg.includes('exceeds cantidad_comprada')) {
      throw new BadRequestException(
        'La cantidad recibida supera la cantidad comprada en este pedido',
      );
    }
    if (msg.includes('receipt already confirmed')) {
      throw new ConflictException(
        'Esta línea de recepción ya fue confirmada anteriormente',
      );
    }
    if (msg.includes('is cancelled')) {
      throw new ConflictException(
        'No se puede confirmar: la compra de proveedor fue cancelada',
      );
    }
    if (msg.includes('detalle_compra') && msg.includes('does not exist')) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }
    if (msg.includes('employee') && msg.includes('does not exist')) {
      throw new BadRequestException(
        'El empleado asociado no existe en el sistema',
      );
    }
    if (msg.includes('compra_proveedor') && msg.includes('does not exist')) {
      throw new NotFoundException('Compra de proveedor no encontrada');
    }

    throw new BadRequestException(
      'Error al confirmar la recepción. Verifique los datos e intente nuevamente.',
    );
  }

  private mapRecepcion(r: CompraConDetalles) {
    return {
      id: r.idCompraProveedor,
      fecha: r.fechaCompraProveedor,
      estado: r.estadoCompra,
      proveedor: r.proveedor
        ? { id: r.proveedor.idProveedor, nombre: r.proveedor.nombreProveedor }
        : null,
      empleado: r.empleado
        ? {
            id: r.empleado.idEmpleado,
            nombre: `${r.empleado.nombreEmpleado} ${r.empleado.apellidoEmpleado}`,
          }
        : null,
      detalles: r.detalles.map((d) => ({
        id: d.idDetalleCompraProveedor,
        cantidadComprada: d.cantidadComprada,
        cantidadRecibida: d.cantidadRecibida,
        costoUnitario: Number(d.costoUnitarioCompra),
        producto: d.producto
          ? {
              id: d.producto.idProducto,
              titulo: d.producto.tituloProducto,
              sku: d.producto.codigoSku,
              stockActual: d.producto.stockActual,
              stockMinimo: d.producto.stockMinimo,
            }
          : null,
      })),
    };
  }
}

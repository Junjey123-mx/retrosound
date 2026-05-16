import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

type VentaRow = {
  id: number;
  fechaVenta: Date;
  descuento: string | number;
  metodoPago: string;
  estado: string;
  idCliente: number;
  idEmpleado: number | null;
  cliente: Record<string, unknown>;
  empleado: Record<string, unknown> | null;
  detalles: Record<string, unknown>[];
};


type DetalleItem = {
  cantidadVendida: number;
  precioUnitario: string | number;
  descuentoDetalle: string | number;
};

@Injectable()
export class VentasService {
  constructor(
    private readonly db: DatabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const result = await this.db.query<VentaRow>(this.baseVentaQuery(`
      ORDER BY v.fecha_venta DESC, v.id_venta DESC
    `));

    return result.rows.map((row) => this.mapVenta(row));
  }

  async findOne(id: number) {
    const result = await this.db.query<VentaRow>(
      this.baseVentaQuery(`
        WHERE v.id_venta = $1
      `),
      [id],
    );

    const venta = result.rows[0];
    if (!venta) throw new NotFoundException('Venta no encontrada');

    return this.mapVenta(venta);
  }

  async create(dto: CreateVentaDto, idEmpleado: number | null) {
    if (!idEmpleado) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un empleado asociado',
      );
    }

    // Items JSONB: [{"idProducto": N, "cantidad": N, "descuento": N}, ...]
    const itemsJson = JSON.stringify(
      dto.detalles.map((d) => ({
        idProducto: d.idProducto,
        cantidad: d.cantidadVendida,
        descuento: d.descuentoDetalle ?? 0,
      })),
    );

    // sp_crear_venta(p_id_cliente, p_id_empleado, p_metodo_pago,
    //   p_descuento_venta, p_items JSONB, OUT p_id_venta_generada)
    const spResult = await this.prisma
      .$queryRaw<Array<{ p_id_venta_generada: number }>>`
        CALL sp_crear_venta(
          ${dto.idCliente}::integer,
          ${idEmpleado}::integer,
          ${dto.metodoPago}::varchar,
          ${dto.descuento ?? 0}::numeric,
          ${itemsJson}::jsonb,
          NULL::integer
        )
      `
      .catch((err: unknown) => this.mapSpError(err));

    const idVenta = Number(spResult[0].p_id_venta_generada);
    const venta = await this.findOne(idVenta);

    const detalles = venta.detalles as DetalleItem[];
    const subtotal = Math.round(
      detalles.reduce(
        (acc, d) =>
          acc +
          Number(d.cantidadVendida) * Number(d.precioUnitario) -
          Number(d.descuentoDetalle ?? 0),
        0,
      ) * 100,
    ) / 100;
    const descuento = Number(venta.descuento ?? 0);
    const totalNeto = Math.round((subtotal - descuento) * 100) / 100;
    const total = Math.round(totalNeto * 1.12 * 100) / 100;

    return {
      ...venta,
      subtotal,
      totalNeto,
      total,
      mensaje: 'Venta registrada correctamente',
    };
  }

  private mapSpError(error: unknown): never {
    let msg = '';
    if (error instanceof Error) {
      msg = error.message.toLowerCase();
      const meta = (error as { meta?: { message?: string } }).meta;
      if (meta?.message) msg += ' ' + meta.message.toLowerCase();
    }

    if (msg.includes('employee') && msg.includes('does not exist')) {
      throw new BadRequestException(
        'El empleado asociado no existe en el sistema',
      );
    }
    if (msg.includes('client') && msg.includes('does not exist')) {
      throw new NotFoundException('Cliente no encontrado');
    }
    if (msg.includes('product') && msg.includes('does not exist')) {
      throw new NotFoundException('Producto no encontrado o descontinuado');
    }
    if (msg.includes('insufficient stock')) {
      throw new ConflictException(
        'Stock insuficiente para uno o más productos',
      );
    }
    if (msg.includes('cantidad must be > 0')) {
      throw new BadRequestException(
        'La cantidad de cada producto debe ser mayor a 0',
      );
    }
    if (msg.includes('items cannot be empty')) {
      throw new BadRequestException(
        'La venta debe incluir al menos un producto',
      );
    }

    throw new BadRequestException(
      'Error al registrar la venta. Verifique los datos e intente nuevamente.',
    );
  }

  private baseVentaQuery(tailSql: string) {
    return `
      SELECT
        v.id_venta AS "id",
        v.fecha_venta AS "fechaVenta",
        v.descuento_venta AS "descuento",
        v.metodo_pago AS "metodoPago",
        v.estado_venta AS "estado",
        v.id_cliente AS "idCliente",
        v.id_empleado AS "idEmpleado",
        jsonb_build_object(
          'id', c.id_cliente,
          'nombre', c.nombre_cliente,
          'apellido', c.apellido_cliente,
          'telefono', c.telefono_cliente,
          'correo', c.correo_cliente,
          'direccion', c.direccion_cliente,
          'fechaRegistro', c.fecha_registro_cliente,
          'estado', c.estado_cliente,
          'fechaInactivacion', c.fecha_inactivacion
        ) AS cliente,
        CASE
          WHEN e.id_empleado IS NULL THEN NULL
          ELSE jsonb_build_object(
            'id', e.id_empleado,
            'nombre', e.nombre_empleado,
            'apellido', e.apellido_empleado,
            'telefono', e.telefono_empleado,
            'correo', e.correo_empleado,
            'fechaContratacion', e.fecha_contratacion,
            'estado', e.estado_empleado,
            'fechaInactivacion', e.fecha_inactivacion
          )
        END AS empleado,
        COALESCE(detalles.items, '[]'::jsonb) AS detalles
      FROM venta v
      JOIN cliente c ON c.id_cliente = v.id_cliente
      LEFT JOIN empleado e ON e.id_empleado = v.id_empleado
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', dv.id_detalle_venta,
            'idVenta', dv.id_venta,
            'idProducto', dv.id_producto,
            'cantidadVendida', dv.cantidad_vendida,
            'precioUnitario', dv.precio_unitario_venta,
            'descuentoDetalle', dv.descuento_detalle,
            'producto', jsonb_build_object(
              'id', p.id_producto,
              'titulo', p.titulo_producto,
              'descripcion', p.descripcion_producto,
              'anioLanzamiento', p.anio_lanzamiento,
              'precioVenta', p.precio_venta,
              'stockActual', p.stock_actual,
              'stockMinimo', p.stock_minimo,
              'codigoSku', p.codigo_sku,
              'estado', p.estado_producto,
              'fechaInactivacion', p.fecha_inactivacion,
              'idCategoria', p.id_categoria,
              'idFormato', p.id_formato
            )
          )
          ORDER BY dv.id_detalle_venta
        ) AS items
        FROM detalle_venta dv
        JOIN producto p ON p.id_producto = dv.id_producto
        WHERE dv.id_venta = v.id_venta
      ) detalles ON true
      ${tailSql}
    `;
  }

  private mapVenta(row: VentaRow) {
    return {
      ...row,
      descuento: Number(row.descuento),
      detalles: row.detalles ?? [],
    };
  }
}

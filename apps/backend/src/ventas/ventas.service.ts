import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
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

type ProductoStockRow = {
  id_producto: number;
  stock_actual: number;
  titulo_producto: string;
};

@Injectable()
export class VentasService {
  constructor(private readonly db: DatabaseService) {}

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

  async create(dto: CreateVentaDto) {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      const clienteResult = await client.query<{ id_cliente: number }>(
        `
        SELECT id_cliente
        FROM cliente
        WHERE id_cliente = $1
          AND estado_cliente = 'activo'
        `,
        [dto.idCliente],
      );

      if (clienteResult.rowCount === 0) {
        throw new NotFoundException(
          `Cliente ${dto.idCliente} no encontrado o inactivo`,
        );
      }

      const empleadoResult = await client.query<{ id_empleado: number }>(
        `
        SELECT id_empleado
        FROM empleado
        WHERE id_empleado = $1
          AND estado_empleado = 'activo'
        `,
        [dto.idEmpleado],
      );

      if (empleadoResult.rowCount === 0) {
        throw new NotFoundException(
          `Empleado ${dto.idEmpleado} no encontrado o inactivo`,
        );
      }

      const productosSolicitados = new Set<number>();
      for (const detalle of dto.detalles) {
        if (productosSolicitados.has(detalle.idProducto)) {
          throw new BadRequestException(
            `Producto ${detalle.idProducto} repetido en el detalle de venta`,
          );
        }
        productosSolicitados.add(detalle.idProducto);

        if (detalle.cantidadVendida < 1) {
          throw new BadRequestException(
            `Cantidad inválida para producto ${detalle.idProducto}: debe ser >= 1`,
          );
        }

        if (detalle.precioUnitario < 0) {
          throw new BadRequestException(
            `Precio inválido para producto ${detalle.idProducto}: debe ser >= 0`,
          );
        }

        const descuentoDetalle = detalle.descuentoDetalle ?? 0;
        if (descuentoDetalle < 0) {
          throw new BadRequestException(
            `Descuento inválido para producto ${detalle.idProducto}: debe ser >= 0`,
          );
        }

        const productoResult = await client.query<ProductoStockRow>(
          `
          SELECT id_producto, stock_actual, titulo_producto
          FROM producto
          WHERE id_producto = $1
            AND estado_producto != 'descontinuado'
          FOR UPDATE
          `,
          [detalle.idProducto],
        );

        const producto = productoResult.rows[0];
        if (!producto) {
          throw new NotFoundException(
            `Producto ${detalle.idProducto} no encontrado o descontinuado`,
          );
        }

        if (producto.stock_actual < detalle.cantidadVendida) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo_producto}": ` +
            `disponible=${producto.stock_actual}, solicitado=${detalle.cantidadVendida}`,
          );
        }
      }

      const totalBruto = Math.round(
        dto.detalles.reduce((acc, detalle) => {
          const descuentoDetalle = detalle.descuentoDetalle ?? 0;
          const subtotalLinea =
            detalle.cantidadVendida * detalle.precioUnitario;

          if (descuentoDetalle > subtotalLinea) {
            throw new BadRequestException(
              'El descuento del detalle no puede superar el subtotal de la línea.',
            );
          }

          return acc + subtotalLinea - descuentoDetalle;
        }, 0) * 100,
      ) / 100;
      const descuentoVenta = Number(dto.descuento ?? 0);

      if (descuentoVenta > totalBruto) {
        throw new BadRequestException(
          'El descuento no puede superar el subtotal de la venta.',
        );
      }

      const ventaResult = await client.query<{
        id_venta: number;
        fecha_venta: Date;
        metodo_pago: string;
        estado_venta: string;
      }>(
        `
        INSERT INTO venta
          (fecha_venta, descuento_venta, metodo_pago, estado_venta, id_cliente, id_empleado)
        VALUES
          ($1::DATE, $2, $3, 'pendiente', $4, $5)
        RETURNING id_venta, fecha_venta, metodo_pago, estado_venta
        `,
        [
          dto.fechaVenta,
          descuentoVenta,
          dto.metodoPago,
          dto.idCliente,
          dto.idEmpleado,
        ],
      );
      const venta = ventaResult.rows[0];

      const detallesResult: {
        idProducto: number;
        cantidadVendida: number;
        precioUnitario: number;
        descuentoDetalle: number;
        subtotal: number;
      }[] = [];

      for (const detalle of dto.detalles) {
        const descuento = detalle.descuentoDetalle ?? 0;
        const subtotal = detalle.cantidadVendida * detalle.precioUnitario - descuento;

        await client.query(
          `
          INSERT INTO detalle_venta
            (id_venta, id_producto, cantidad_vendida, precio_unitario_venta, descuento_detalle)
          VALUES
            ($1, $2, $3, $4, $5)
          `,
          [
            venta.id_venta,
            detalle.idProducto,
            detalle.cantidadVendida,
            detalle.precioUnitario,
            descuento,
          ],
        );

        await client.query(
          `
          UPDATE producto
          SET stock_actual = stock_actual - $1
          WHERE id_producto = $2
          `,
          [detalle.cantidadVendida, detalle.idProducto],
        );

        detallesResult.push({
          idProducto: detalle.idProducto,
          cantidadVendida: detalle.cantidadVendida,
          precioUnitario: detalle.precioUnitario,
          descuentoDetalle: descuento,
          subtotal: Math.round(subtotal * 100) / 100,
        });
      }

      const totalNeto = Math.round((totalBruto - descuentoVenta) * 100) / 100;
      const iva12 = Math.round(totalNeto * 0.12 * 100) / 100;
      const total = Math.round(totalNeto * 1.12 * 100) / 100;

      await client.query('COMMIT');

      return {
        venta: {
          idVenta: venta.id_venta,
          fechaVenta: venta.fecha_venta,
          metodoPago: venta.metodo_pago,
          estadoVenta: venta.estado_venta,
          idCliente: dto.idCliente,
          idEmpleado: dto.idEmpleado,
        },
        detalles: detallesResult,
        recibo: {
          totalBruto: Math.round(totalBruto * 100) / 100,
          descuentoVenta,
          totalNeto,
          iva12,
          total,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

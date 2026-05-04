import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database';

type OrdenRow = {
  id_venta: number;
  fecha_venta: Date;
  estado_venta: string;
  metodo_pago: string;
  descuento_venta: string | number;
};

type OrdenItemRow = {
  id_detalle_venta: number;
  id_venta: number;
  id_producto: number;
  titulo_producto: string;
  codigo_sku: string;
  formato: string;
  categoria: string;
  artistas: string[];
  generos: string[];
  cantidad_vendida: number;
  precio_unitario_venta: string | number;
  descuento_detalle: string | number;
};

@Injectable()
export class MisOrdenesService {
  constructor(private readonly db: DatabaseService) {}

  private async resolveIdCliente(idUsuario: number): Promise<number> {
    const result = await this.db.query<{ id_cliente: number | null }>(
      `
      SELECT u.id_cliente
      FROM usuario u
      JOIN cliente c ON c.id_cliente = u.id_cliente
      WHERE u.id_usuario = $1
        AND u.estado_usuario = 'activo'
        AND c.estado_cliente = 'activo'
      LIMIT 1
      `,
      [idUsuario],
    );

    const idCliente = result.rows[0]?.id_cliente;
    if (!idCliente) {
      throw new ForbiddenException(
        'El usuario autenticado no tiene un perfil de cliente asociado',
      );
    }

    return idCliente;
  }

  async findByUsuario(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const ventasResult = await this.db.query<OrdenRow>(
      `
      SELECT
        id_venta,
        fecha_venta,
        estado_venta,
        metodo_pago,
        descuento_venta
      FROM venta
      WHERE id_cliente = $1
      ORDER BY fecha_venta DESC, id_venta DESC
      `,
      [idCliente],
    );

    const ventas = ventasResult.rows;
    if (ventas.length === 0) return [];

    const ids = ventas.map((venta) => venta.id_venta);
    const itemsResult = await this.db.query<OrdenItemRow>(
      `
      SELECT
        dv.id_detalle_venta,
        dv.id_venta,
        dv.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        f.nombre_formato AS formato,
        c.nombre_categoria AS categoria,
        COALESCE(artistas.nombres, ARRAY[]::text[]) AS artistas,
        COALESCE(generos.nombres, ARRAY[]::text[]) AS generos,
        dv.cantidad_vendida,
        dv.precio_unitario_venta,
        dv.descuento_detalle
      FROM detalle_venta dv
      JOIN producto p ON p.id_producto = dv.id_producto
      JOIN formato f ON f.id_formato = p.id_formato
      JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN LATERAL (
        SELECT array_agg(a.nombre_artista ORDER BY a.nombre_artista) AS nombres
        FROM producto_artista pa
        JOIN artista a ON a.id_artista = pa.id_artista
        WHERE pa.id_producto = p.id_producto
      ) artistas ON true
      LEFT JOIN LATERAL (
        SELECT array_agg(g.nombre_genero_musical ORDER BY g.nombre_genero_musical) AS nombres
        FROM producto_genero pg
        JOIN genero_musical g ON g.id_genero_musical = pg.id_genero_musical
        WHERE pg.id_producto = p.id_producto
      ) generos ON true
      WHERE dv.id_venta = ANY($1::int[])
      ORDER BY dv.id_venta, dv.id_detalle_venta
      `,
      [ids],
    );

    const itemsByVenta = new Map<number, OrdenItemRow[]>();
    for (const item of itemsResult.rows) {
      const current = itemsByVenta.get(item.id_venta) ?? [];
      current.push(item);
      itemsByVenta.set(item.id_venta, current);
    }

    return ventas.map((venta) => {
      const items = (itemsByVenta.get(venta.id_venta) ?? []).map((detalle) => {
        const precioUnitario = Number(detalle.precio_unitario_venta);
        const descuentoDetalle = Number(detalle.descuento_detalle);
        const subtotalLinea = this.roundMoney(
          detalle.cantidad_vendida * precioUnitario,
        );
        const totalLinea = this.roundMoney(subtotalLinea - descuentoDetalle);

        return {
          idDetalleVenta: detalle.id_detalle_venta,
          idProducto: detalle.id_producto,
          tituloProducto: detalle.titulo_producto,
          codigoSku: detalle.codigo_sku,
          formato: detalle.formato,
          categoria: detalle.categoria,
          artistas: detalle.artistas,
          generos: detalle.generos,
          cantidad: detalle.cantidad_vendida,
          precioUnitario,
          descuentoDetalle,
          subtotalLinea,
          totalLinea,
        };
      });

      const subtotal = this.roundMoney(
        items.reduce((acc, item) => acc + item.subtotalLinea, 0),
      );
      const descuentoVenta = Number(venta.descuento_venta);
      const totalNeto = this.roundMoney(subtotal - descuentoVenta);
      const iva12 = this.roundMoney(totalNeto * 0.12);
      const total = this.roundMoney(totalNeto * 1.12);

      return {
        idVenta: venta.id_venta,
        fechaVenta: venta.fecha_venta,
        estadoVenta: venta.estado_venta,
        metodoPago: venta.metodo_pago,
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

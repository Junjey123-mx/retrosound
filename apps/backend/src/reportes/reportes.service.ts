import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteQueryDto } from './dto/reporte-query.dto';
import { ExportReporteDto } from './dto/export-reporte.dto';

const TIPOS_CSV = [
  'resumen-ventas',
  'ventas-detalle',
  'catalogo',
  'compras',
  'stock-bajo',
  'clientes-frecuentes',
  'mas-vendidos',
  'ranking-ingresos',
] as const;

type TipoCSV = (typeof TIPOS_CSV)[number];

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── JOIN múltiple (1/3): venta → cliente, empleado, detalle_venta → producto
  async ventasDetalle(query: ReporteQueryDto = {}): Promise<object[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.fechaInicio) {
      params.push(query.fechaInicio);
      conditions.push(`v.fecha_venta >= $${params.length}::date`);
    }
    if (query.fechaFin) {
      params.push(query.fechaFin);
      conditions.push(`v.fecha_venta <= $${params.length}::date`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.metodo_pago,
        v.estado_venta,
        v.descuento_venta,
        (c.nombre_cliente || ' ' || c.apellido_cliente)                          AS cliente,
        c.correo_cliente,
        COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Venta Online') AS empleado,
        p.titulo_producto,
        p.codigo_sku,
        dv.cantidad_vendida,
        dv.precio_unitario_venta,
        dv.descuento_detalle,
        (dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle)  AS subtotal
      FROM venta v
      JOIN cliente       c  ON c.id_cliente  = v.id_cliente
      LEFT JOIN empleado e  ON e.id_empleado = v.id_empleado
      JOIN detalle_venta dv ON dv.id_venta   = v.id_venta
      JOIN producto      p  ON p.id_producto = dv.id_producto
      ${whereClause}
      ORDER BY v.fecha_venta DESC, v.id_venta
    `;

    return params.length
      ? this.prisma.$queryRawUnsafe(sql, ...params)
      : this.prisma.$queryRawUnsafe(sql);
  }

  // ── JOIN múltiple (2/3): producto → categoria, formato, artistas, géneros
  async productosCatalogo(query: ReporteQueryDto = {}): Promise<object[]> {
    const params: unknown[] = [];
    let searchCondition = '';

    if (query.search) {
      params.push(`%${query.search}%`);
      searchCondition = `AND (p.titulo_producto ILIKE $1 OR p.codigo_sku ILIKE $1)`;
    }

    const sql = `
      SELECT
        p.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        p.precio_venta,
        p.stock_actual,
        p.stock_minimo,
        p.estado_producto,
        cat.nombre_categoria,
        fmt.nombre_formato,
        STRING_AGG(DISTINCT a.nombre_artista,       ', ') AS artistas,
        STRING_AGG(DISTINCT g.nombre_genero_musical, ', ') AS generos
      FROM producto p
      JOIN categoria    cat ON cat.id_categoria     = p.id_categoria
      JOIN formato      fmt ON fmt.id_formato       = p.id_formato
      LEFT JOIN producto_artista pa ON pa.id_producto      = p.id_producto
      LEFT JOIN artista           a  ON a.id_artista       = pa.id_artista
      LEFT JOIN producto_genero  pg ON pg.id_producto      = p.id_producto
      LEFT JOIN genero_musical    g  ON g.id_genero_musical = pg.id_genero_musical
      WHERE p.estado_producto != 'descontinuado'
        ${searchCondition}
      GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
      ORDER BY p.titulo_producto
    `;

    return params.length
      ? this.prisma.$queryRawUnsafe(sql, ...params)
      : this.prisma.$queryRawUnsafe(sql);
  }

  // ── JOIN múltiple (3/3): compra_proveedor → proveedor, empleado → detalle → producto
  async comprasProveedor(): Promise<object[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT
        cp.id_compra_proveedor,
        cp.fecha_compra_proveedor,
        cp.estado_compra,
        pr.nombre_proveedor,
        pr.correo_proveedor,
        COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Sin asignar') AS empleado_responsable,
        p.titulo_producto,
        p.codigo_sku,
        dcp.cantidad_comprada,
        dcp.costo_unitario_compra,
        (dcp.cantidad_comprada * dcp.costo_unitario_compra) AS costo_total
      FROM compra_proveedor cp
      JOIN proveedor                pr  ON pr.id_proveedor         = cp.id_proveedor
      LEFT JOIN empleado            e   ON e.id_empleado           = cp.id_empleado
      JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
      JOIN producto                 p   ON p.id_producto           = dcp.id_producto
      ORDER BY cp.fecha_compra_proveedor DESC, cp.id_compra_proveedor
    `);
  }

  // ── Subquery en FROM: productos con stock ≤ su mínimo + proveedor principal
  async productosStockBajo(): Promise<object[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT
        p.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        p.stock_actual,
        p.stock_minimo,
        (p.stock_minimo - p.stock_actual)                       AS diferencia,
        p.estado_producto,
        cat.nombre_categoria,
        fmt.nombre_formato,
        ROUND((SELECT AVG(stock_actual) FROM producto)::NUMERIC, 2) AS promedio_stock_general,
        prov.nombre_proveedor                                    AS proveedor_principal
      FROM producto p
      JOIN categoria cat ON cat.id_categoria = p.id_categoria
      JOIN formato   fmt ON fmt.id_formato   = p.id_formato
      LEFT JOIN producto_proveedor pp
        ON pp.id_producto = p.id_producto AND pp.es_proveedor_principal = true
      LEFT JOIN proveedor prov ON prov.id_proveedor = pp.id_proveedor
      WHERE p.stock_actual <= p.stock_minimo
        AND p.estado_producto != 'descontinuado'
      ORDER BY p.stock_actual ASC
    `);
  }

  // ── Subquery EXISTS + correlacionado: clientes frecuentes con totales
  async clientesFrecuentes(query: ReporteQueryDto = {}): Promise<object[]> {
    const params: unknown[] = [];
    let searchCondition = '';

    if (query.search) {
      params.push(`%${query.search}%`);
      searchCondition = `AND (c.nombre_cliente ILIKE $1 OR c.apellido_cliente ILIKE $1 OR c.correo_cliente ILIKE $1)`;
    }

    const sql = `
      SELECT
        c.id_cliente,
        (c.nombre_cliente || ' ' || c.apellido_cliente) AS cliente,
        c.correo_cliente,
        c.telefono_cliente,
        c.direccion_cliente,
        c.fecha_registro_cliente,
        (
          SELECT COUNT(*)
          FROM venta v2
          WHERE v2.id_cliente  = c.id_cliente
            AND v2.estado_venta = 'completada'
        )::INT AS ventas_completadas,
        COALESCE((
          SELECT SUM(dv.cantidad_vendida * dv.precio_unitario_venta)
          FROM venta v3
          JOIN detalle_venta dv ON dv.id_venta = v3.id_venta
          WHERE v3.id_cliente  = c.id_cliente
            AND v3.estado_venta = 'completada'
        ), 0) AS total_gastado,
        (
          SELECT MAX(v4.fecha_venta)
          FROM venta v4
          WHERE v4.id_cliente  = c.id_cliente
            AND v4.estado_venta = 'completada'
        ) AS ultima_compra
      FROM cliente c
      WHERE EXISTS (
        SELECT 1
        FROM venta v
        WHERE v.id_cliente   = c.id_cliente
          AND v.estado_venta = 'completada'
      )
        AND c.estado_cliente = 'activo'
        ${searchCondition}
      ORDER BY ventas_completadas DESC, c.nombre_cliente
    `;

    return params.length
      ? this.prisma.$queryRawUnsafe(sql, ...params)
      : this.prisma.$queryRawUnsafe(sql);
  }

  // ── GROUP BY + HAVING + SUM / COUNT / AVG: productos más vendidos
  async productosMasVendidos(minVendidos = 1): Promise<object[]> {
    const min = Math.max(1, Math.floor(Number(minVendidos)));
    return this.prisma.$queryRawUnsafe(
      `
      SELECT
        p.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        p.precio_venta,
        cat.nombre_categoria,
        fmt.nombre_formato,
        SUM(dv.cantidad_vendida)::INT                              AS total_unidades,
        COUNT(DISTINCT dv.id_venta)::INT                          AS en_ventas,
        SUM(dv.cantidad_vendida * dv.precio_unitario_venta
            - dv.descuento_detalle)                               AS ingresos_generados,
        ROUND(AVG(dv.precio_unitario_venta)::NUMERIC, 2)          AS precio_promedio_venta
      FROM detalle_venta dv
      JOIN producto  p   ON p.id_producto    = dv.id_producto
      JOIN categoria cat ON cat.id_categoria = p.id_categoria
      JOIN formato   fmt ON fmt.id_formato   = p.id_formato
      GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
      HAVING SUM(dv.cantidad_vendida) >= $1
      ORDER BY total_unidades DESC, ingresos_generados DESC
      `,
      min,
    );
  }

  // ── CTE (WITH) + DENSE_RANK(): ranking de productos por ingresos
  async rankingIngresos(): Promise<object[]> {
    return this.prisma.$queryRawUnsafe(`
      WITH ingresos_producto AS (
        SELECT
          p.id_producto,
          p.titulo_producto,
          p.codigo_sku,
          p.precio_venta,
          cat.nombre_categoria,
          fmt.nombre_formato,
          COALESCE(SUM(
            dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle
          ), 0) AS ingresos_totales,
          COALESCE(SUM(dv.cantidad_vendida), 0)::INT AS unidades_vendidas
        FROM producto p
        JOIN categoria    cat ON cat.id_categoria = p.id_categoria
        JOIN formato      fmt ON fmt.id_formato   = p.id_formato
        LEFT JOIN detalle_venta dv ON dv.id_producto = p.id_producto
        GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
      )
      SELECT
        DENSE_RANK() OVER (ORDER BY ingresos_totales DESC)::INT AS ranking,
        id_producto,
        titulo_producto,
        codigo_sku,
        nombre_categoria,
        nombre_formato,
        precio_venta,
        ingresos_totales,
        unidades_vendidas
      FROM ingresos_producto
      ORDER BY ranking, titulo_producto
    `);
  }

  // ── Vista vista_resumen_ventas con filtro opcional de estado
  async resumenVentas(estado?: string): Promise<object[]> {
    const estadosValidos = ['pendiente', 'completada', 'cancelada'];
    if (estado && estadosValidos.includes(estado)) {
      return this.prisma.$queryRawUnsafe(
        `SELECT * FROM vista_resumen_ventas WHERE estado_venta::TEXT = $1 ORDER BY fecha_venta DESC`,
        estado,
      );
    }
    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM vista_resumen_ventas ORDER BY fecha_venta DESC`,
    );
  }

  // ── Dashboard ejecutivo (resumen + alertas + recientes)
  async getDashboard(): Promise<object> {
    const [statsRows, alertasStock, comprasPendientes, ventasRecientes] =
      await Promise.all([
        this.prisma.$queryRawUnsafe<object[]>(`
          SELECT
            (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto  = 'activo')                               AS productos_activos,
            (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto  = 'agotado')                              AS productos_agotados,
            (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto != 'descontinuado'
                                                          AND stock_actual    <= stock_minimo)                           AS productos_stock_critico,
            (SELECT COUNT(*)::INT FROM venta            WHERE estado_venta    = 'completada')                            AS ventas_completadas,
            (SELECT COUNT(*)::INT FROM compra_proveedor WHERE estado_compra   = 'pendiente')                             AS compras_pendientes,
            COALESCE((
              SELECT SUM(total_neto)
              FROM   vista_resumen_ventas
              WHERE  estado_venta = 'completada'
                AND  DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', NOW())
            ), 0) AS total_vendido_mes
        `),
        this.prisma.$queryRawUnsafe(`
          SELECT
            p.id_producto, p.titulo_producto, p.codigo_sku,
            p.stock_actual, p.stock_minimo,
            cat.nombre_categoria, fmt.nombre_formato
          FROM producto p
          JOIN categoria cat ON cat.id_categoria = p.id_categoria
          JOIN formato   fmt ON fmt.id_formato   = p.id_formato
          WHERE p.stock_actual <= p.stock_minimo
            AND p.estado_producto != 'descontinuado'
          ORDER BY p.stock_actual ASC
          LIMIT 10
        `),
        this.prisma.$queryRawUnsafe(`
          SELECT
            cp.id_compra_proveedor,
            cp.fecha_compra_proveedor,
            pr.nombre_proveedor,
            COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Sin asignar') AS empleado,
            COUNT(dcp.id_detalle_compra_proveedor)::INT AS num_productos
          FROM compra_proveedor cp
          JOIN proveedor pr ON pr.id_proveedor = cp.id_proveedor
          LEFT JOIN empleado e ON e.id_empleado = cp.id_empleado
          LEFT JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
          WHERE cp.estado_compra = 'pendiente'
          GROUP BY
            cp.id_compra_proveedor, cp.fecha_compra_proveedor,
            pr.nombre_proveedor, e.nombre_empleado, e.apellido_empleado
          ORDER BY cp.fecha_compra_proveedor DESC
          LIMIT 10
        `),
        this.prisma.$queryRawUnsafe(`
          SELECT
            v.id_venta, v.fecha_venta, v.estado_venta, v.metodo_pago,
            (c.nombre_cliente || ' ' || c.apellido_cliente) AS cliente,
            ROUND(
              COALESCE(SUM(dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle), 0)
              - v.descuento_venta, 2
            ) AS total_neto
          FROM venta v
          JOIN cliente c ON c.id_cliente = v.id_cliente
          LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
          GROUP BY
            v.id_venta, v.fecha_venta, v.estado_venta, v.metodo_pago,
            c.nombre_cliente, c.apellido_cliente, v.descuento_venta
          ORDER BY v.fecha_venta DESC, v.id_venta DESC
          LIMIT 8
        `),
      ]);

    return {
      stats: (statsRows as object[])[0],
      alertasStock,
      comprasPendientes,
      ventasRecientes,
    };
  }

  // ── Exportación CSV
  async exportCsv(
    dto: ExportReporteDto,
  ): Promise<{ csv: string; filename: string }> {
    if (!TIPOS_CSV.includes(dto.tipo as TipoCSV)) {
      throw new BadRequestException(
        `Tipo de reporte no soportado. Valores válidos: ${TIPOS_CSV.join(', ')}`,
      );
    }

    let rows: object[] = [];

    switch (dto.tipo as TipoCSV) {
      case 'resumen-ventas':
        rows = await this.resumenVentas();
        break;
      case 'ventas-detalle':
        rows = await this.ventasDetalle();
        break;
      case 'catalogo':
        rows = await this.productosCatalogo();
        break;
      case 'compras':
        rows = await this.comprasProveedor();
        break;
      case 'stock-bajo':
        rows = await this.productosStockBajo();
        break;
      case 'clientes-frecuentes':
        rows = await this.clientesFrecuentes();
        break;
      case 'mas-vendidos':
        rows = await this.productosMasVendidos();
        break;
      case 'ranking-ingresos':
        rows = await this.rankingIngresos();
        break;
    }

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return {
      csv: this.toCSV(rows as Record<string, unknown>[]),
      filename: `reporte-${dto.tipo}-${date}.csv`,
    };
  }

  private toCSV(rows: Record<string, unknown>[]): string {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown): string => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    return [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ].join('\n');
  }
}

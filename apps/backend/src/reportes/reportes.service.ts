import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database';

@Injectable()
export class ReportesService {
  constructor(private readonly db: DatabaseService) {}

  // ── RÚBRICA: JOIN múltiple (1/3) ──────────────────────────────────────────
  // Ventas con cliente, empleado, producto, cantidad, precio y subtotal.
  // Tablas: venta ⟶ cliente, empleado, detalle_venta ⟶ producto
  async ventasDetalle() {
    const result = await this.db.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.metodo_pago,
        v.estado_venta,
        v.descuento_venta,
        (c.nombre_cliente || ' ' || c.apellido_cliente)   AS cliente,
        c.correo_cliente,
        COALESCE(e.nombre_empleado || ' ' || e.apellido_empleado, 'Venta Online') AS empleado,
        p.titulo_producto,
        p.codigo_sku,
        dv.cantidad_vendida,
        dv.precio_unitario_venta,
        dv.descuento_detalle,
        (dv.cantidad_vendida * dv.precio_unitario_venta - dv.descuento_detalle) AS subtotal
      FROM venta v
      JOIN cliente       c  ON c.id_cliente  = v.id_cliente
      LEFT JOIN empleado e  ON e.id_empleado = v.id_empleado
      JOIN detalle_venta dv ON dv.id_venta   = v.id_venta
      JOIN producto      p  ON p.id_producto = dv.id_producto
      ORDER BY v.fecha_venta DESC, v.id_venta
    `);
    return result.rows;
  }

  // ── RÚBRICA: JOIN múltiple (2/3) ──────────────────────────────────────────
  // Productos con su categoría, formato, artistas y géneros.
  // Tablas: producto ⟶ categoria, formato, producto_artista ⟶ artista,
  //         producto_genero ⟶ genero_musical
  async productosCatalogo() {
    const result = await this.db.query(`
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
        STRING_AGG(DISTINCT a.nombre_artista,  ', ') AS artistas,
        STRING_AGG(DISTINCT g.nombre_genero_musical, ', ') AS generos
      FROM producto p
      JOIN categoria    cat ON cat.id_categoria = p.id_categoria
      JOIN formato      fmt ON fmt.id_formato   = p.id_formato
      LEFT JOIN producto_artista pa ON pa.id_producto = p.id_producto
      LEFT JOIN artista           a  ON a.id_artista  = pa.id_artista
      LEFT JOIN producto_genero  pg ON pg.id_producto       = p.id_producto
      LEFT JOIN genero_musical    g  ON g.id_genero_musical = pg.id_genero_musical
      WHERE p.estado_producto != 'descontinuado'
      GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
      ORDER BY p.titulo_producto
    `);
    return result.rows;
  }

  // ── RÚBRICA: JOIN múltiple (3/3) ──────────────────────────────────────────
  // Compras a proveedor con empleado responsable y detalle de productos.
  // Tablas: compra_proveedor ⟶ proveedor, empleado,
  //         detalle_compra_proveedor ⟶ producto
  async comprasProveedor() {
    const result = await this.db.query(`
      SELECT
        cp.id_compra_proveedor,
        cp.fecha_compra_proveedor,
        cp.estado_compra,
        pr.nombre_proveedor,
        pr.correo_proveedor,
        (e.nombre_empleado || ' ' || e.apellido_empleado) AS empleado_responsable,
        p.titulo_producto,
        p.codigo_sku,
        dcp.cantidad_comprada,
        dcp.costo_unitario_compra,
        (dcp.cantidad_comprada * dcp.costo_unitario_compra) AS costo_total
      FROM compra_proveedor cp
      JOIN proveedor                pr  ON pr.id_proveedor        = cp.id_proveedor
      JOIN empleado                 e   ON e.id_empleado          = cp.id_empleado
      JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
      JOIN producto                 p   ON p.id_producto          = dcp.id_producto
      ORDER BY cp.fecha_compra_proveedor DESC, cp.id_compra_proveedor
    `);
    return result.rows;
  }

  // ── RÚBRICA: Subquery en FROM / escalar (1/2) ─────────────────────────────
  // Productos cuyo stock_actual está por debajo o igual al promedio de todos.
  // Subquery escalar: (SELECT AVG(stock_actual) FROM producto)
  async productosStockBajo() {
    const result = await this.db.query(`
      SELECT
        p.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        p.stock_actual,
        p.stock_minimo,
        p.estado_producto,
        cat.nombre_categoria,
        fmt.nombre_formato,
        ROUND(stock_prom.promedio, 2) AS promedio_stock_general
      FROM producto p
      JOIN categoria cat ON cat.id_categoria = p.id_categoria
      JOIN formato   fmt ON fmt.id_formato   = p.id_formato
      JOIN (
        SELECT AVG(stock_actual) AS promedio FROM producto
      ) stock_prom ON TRUE
      WHERE p.stock_actual <= stock_prom.promedio
        AND p.estado_producto != 'descontinuado'
      ORDER BY p.stock_actual ASC
    `);
    return result.rows;
  }

  // ── RÚBRICA: Subquery EXISTS (2/2) ────────────────────────────────────────
  // Clientes que tienen al menos una venta en estado 'completada'.
  async clientesFrecuentes() {
    const result = await this.db.query(`
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
          WHERE v2.id_cliente = c.id_cliente
            AND v2.estado_venta = 'completada'
        )::INT AS ventas_completadas
      FROM cliente c
      WHERE EXISTS (
        SELECT 1
        FROM venta v
        WHERE v.id_cliente   = c.id_cliente
          AND v.estado_venta = 'completada'
      )
        AND c.estado_cliente = 'activo'
      ORDER BY ventas_completadas DESC, c.nombre_cliente
    `);
    return result.rows;
  }

  // ── RÚBRICA: GROUP BY + HAVING + funciones de agregación ──────────────────
  // Productos más vendidos: SUM(cantidad_vendida) >= min_vendidos.
  // Parámetro seguro con pg para evitar SQL injection.
  async productosMasVendidos(minVendidos = 1) {
    const min = Math.max(1, Math.floor(Number(minVendidos)));
    const result = await this.db.query(
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
      JOIN producto  p   ON p.id_producto  = dv.id_producto
      JOIN categoria cat ON cat.id_categoria = p.id_categoria
      JOIN formato   fmt ON fmt.id_formato   = p.id_formato
      GROUP BY p.id_producto, cat.nombre_categoria, fmt.nombre_formato
      HAVING SUM(dv.cantidad_vendida) >= $1
      ORDER BY total_unidades DESC, ingresos_generados DESC
    `,
      [min],
    );
    return result.rows;
  }

  // ── RÚBRICA: CTE (WITH) ───────────────────────────────────────────────────
  // Ranking de productos por ingresos totales generados.
  // CTE: calcula ingresos por producto, luego rankea con DENSE_RANK().
  async rankingIngresos() {
    const result = await this.db.query(`
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
    return result.rows;
  }

  // ── DASHBOARD: resumen ejecutivo en una sola llamada ─────────────────────
  // Seis métricas con subqueries escalares + alertas con JOINs explícitos.
  async getDashboard() {
    // ── 1. Estadísticas agregadas (subqueries escalares en un solo SELECT) ──
    const statsResult = await this.db.query<{
      productos_activos:       number;
      productos_agotados:      number;
      productos_stock_critico: number;
      ventas_completadas:      number;
      compras_pendientes:      number;
      total_vendido_mes:       string;
    }>(`
      SELECT
        (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto = 'activo')                                                   AS productos_activos,
        (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto = 'agotado')                                                  AS productos_agotados,
        (SELECT COUNT(*)::INT FROM producto         WHERE estado_producto != 'descontinuado' AND stock_actual <= stock_minimo)           AS productos_stock_critico,
        (SELECT COUNT(*)::INT FROM venta            WHERE estado_venta   = 'completada')                                                AS ventas_completadas,
        (SELECT COUNT(*)::INT FROM compra_proveedor WHERE estado_compra  = 'pendiente')                                                  AS compras_pendientes,
        COALESCE((
          SELECT SUM(total_neto)
          FROM   vista_resumen_ventas
          WHERE  estado_venta = 'completada'
            AND  DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', NOW())
        ), 0) AS total_vendido_mes
    `);
    const stats = statsResult.rows[0];

    // ── 2. Productos con stock crítico (stock_actual <= stock_minimo) ──────
    const alertasStock = await this.db.query<{
      id_producto:      number;
      titulo_producto:  string;
      codigo_sku:       string;
      stock_actual:     number;
      stock_minimo:     number;
      nombre_categoria: string;
      nombre_formato:   string;
    }>(`
      SELECT
        p.id_producto,
        p.titulo_producto,
        p.codigo_sku,
        p.stock_actual,
        p.stock_minimo,
        cat.nombre_categoria,
        fmt.nombre_formato
      FROM producto p
      JOIN categoria cat ON cat.id_categoria = p.id_categoria
      JOIN formato   fmt ON fmt.id_formato   = p.id_formato
      WHERE p.stock_actual <= p.stock_minimo
        AND p.estado_producto != 'descontinuado'
      ORDER BY p.stock_actual ASC
      LIMIT 10
    `);

    // ── 3. Compras pendientes con proveedor y empleado ─────────────────────
    const comprasPendientes = await this.db.query<{
      id_compra_proveedor:    number;
      fecha_compra_proveedor: Date;
      nombre_proveedor:       string;
      empleado:               string;
      num_productos:          number;
    }>(`
      SELECT
        cp.id_compra_proveedor,
        cp.fecha_compra_proveedor,
        pr.nombre_proveedor,
        (e.nombre_empleado || ' ' || e.apellido_empleado)  AS empleado,
        COUNT(dcp.id_detalle_compra_proveedor)::INT        AS num_productos
      FROM compra_proveedor cp
      JOIN proveedor                    pr  ON pr.id_proveedor        = cp.id_proveedor
      JOIN empleado                     e   ON e.id_empleado          = cp.id_empleado
      LEFT JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
      WHERE cp.estado_compra = 'pendiente'
      GROUP BY
        cp.id_compra_proveedor, cp.fecha_compra_proveedor,
        pr.nombre_proveedor, e.nombre_empleado, e.apellido_empleado
      ORDER BY cp.fecha_compra_proveedor DESC
      LIMIT 10
    `);

    // ── 4. Ventas recientes (últimas 8) ────────────────────────────────────
    const ventasRecientes = await this.db.query<{
      id_venta:    number;
      fecha_venta: Date;
      estado_venta: string;
      metodo_pago: string;
      cliente:     string;
      total_neto:  string;
    }>(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.estado_venta,
        v.metodo_pago,
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
    `);

    return {
      stats,
      alertasStock: alertasStock.rows,
      comprasPendientes: comprasPendientes.rows,
      ventasRecientes: ventasRecientes.rows,
    };
  }

  // ── RÚBRICA: VIEW usado por el backend ────────────────────────────────────
  // Consulta la vista vista_resumen_ventas creada en el DDL oficial.
  // Permite filtrar por estado_venta de forma segura.
  async resumenVentas(estado?: string) {
    const estadosValidos = ['pendiente', 'completada', 'cancelada'];
    if (estado && estadosValidos.includes(estado)) {
      const result = await this.db.query(
        `
        SELECT * FROM vista_resumen_ventas
        WHERE estado_venta::TEXT = $1
        ORDER BY fecha_venta DESC
        `,
        [estado],
      );
      return result.rows;
    }

    const result = await this.db.query(`
      SELECT * FROM vista_resumen_ventas
      ORDER BY fecha_venta DESC
    `);
    return result.rows;
  }
}

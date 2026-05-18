import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard() {
    const [
      productosActivos,
      ventasCompletadas,
      productosAgotados,
      comprasPendientesCount,
      usuariosActivos,
      proveedoresActivos,
      [stockCriticoRow],
      [totalMesRow],
      alertasStock,
      comprasPendientes,
      ventasRecientes,
    ] = await Promise.all([
      this.prisma.producto.count({ where: { estadoProducto: 'activo' } }),
      this.prisma.venta.count({ where: { estadoVenta: 'completada' } }),
      this.prisma.producto.count({ where: { estadoProducto: 'agotado' } }),
      this.prisma.compraProveedor.count({ where: { estadoCompra: { in: ['pendiente', 'parcial'] } } }),
      this.prisma.usuario.count({ where: { estadoUsuario: 'activo' } }),
      this.prisma.proveedor.count({ where: { estadoProveedor: 'activo' } }),
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) AS total
        FROM producto
        WHERE estado_producto = 'activo' AND stock_actual <= stock_minimo
      `,
      this.prisma.$queryRaw<Array<{ total: string }>>`
        SELECT COALESCE(SUM(dv.cantidad_vendida * dv.precio_unitario_venta), 0)::text AS total
        FROM detalle_venta dv
        JOIN venta v ON v.id_venta = dv.id_venta
        WHERE v.estado_venta = 'completada'
          AND DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
      `,
      this.prisma.$queryRaw<Array<{
        id_producto: number;
        titulo_producto: string;
        codigo_sku: string;
        stock_actual: number;
        stock_minimo: number;
        nombre_categoria: string;
        nombre_formato: string;
      }>>`
        SELECT p.id_producto, p.titulo_producto, p.codigo_sku,
               p.stock_actual, p.stock_minimo,
               c.nombre_categoria, f.nombre_formato
        FROM producto p
        JOIN categoria c ON c.id_categoria = p.id_categoria
        JOIN formato f ON f.id_formato = p.id_formato
        WHERE p.estado_producto = 'activo' AND p.stock_actual <= p.stock_minimo
        ORDER BY p.stock_actual ASC
        LIMIT 5
      `,
      this.prisma.$queryRaw<Array<{
        id_compra_proveedor: number;
        fecha_compra_proveedor: Date;
        nombre_proveedor: string;
        empleado: string;
        num_productos: bigint;
      }>>`
        SELECT cp.id_compra_proveedor, cp.fecha_compra_proveedor,
               pv.nombre_proveedor,
               CONCAT(e.nombre_empleado, ' ', e.apellido_empleado) AS empleado,
               COUNT(dcp.id_detalle_compra_proveedor) AS num_productos
        FROM compra_proveedor cp
        JOIN proveedor pv ON pv.id_proveedor = cp.id_proveedor
        LEFT JOIN empleado e ON e.id_empleado = cp.id_empleado
        LEFT JOIN detalle_compra_proveedor dcp ON dcp.id_compra_proveedor = cp.id_compra_proveedor
        WHERE cp.estado_compra IN ('pendiente', 'parcial')
        GROUP BY cp.id_compra_proveedor, cp.fecha_compra_proveedor, pv.nombre_proveedor,
                 e.nombre_empleado, e.apellido_empleado
        ORDER BY cp.fecha_compra_proveedor DESC
        LIMIT 5
      `,
      this.prisma.$queryRaw<Array<{
        id_venta: number;
        fecha_venta: Date;
        estado_venta: string;
        metodo_pago: string;
        cliente: string;
        total_neto: string;
      }>>`
        SELECT v.id_venta, v.fecha_venta, v.estado_venta, v.metodo_pago,
               CONCAT(c.nombre_cliente, ' ', c.apellido_cliente) AS cliente,
               COALESCE(SUM(dv.cantidad_vendida * dv.precio_unitario_venta), 0)::text AS total_neto
        FROM venta v
        JOIN cliente c ON c.id_cliente = v.id_cliente
        LEFT JOIN detalle_venta dv ON dv.id_venta = v.id_venta
        GROUP BY v.id_venta, v.fecha_venta, v.estado_venta, v.metodo_pago,
                 c.nombre_cliente, c.apellido_cliente
        ORDER BY v.id_venta DESC
        LIMIT 5
      `,
    ]);

    return {
      stats: {
        productos_activos: productosActivos,
        productos_agotados: productosAgotados,
        productos_stock_critico: Number(stockCriticoRow?.total ?? 0),
        ventas_completadas: ventasCompletadas,
        compras_pendientes: comprasPendientesCount,
        total_vendido_mes: Number(totalMesRow?.total ?? 0),
        usuarios_activos: usuariosActivos,
        proveedores_activos: proveedoresActivos,
      },
      alertasStock: alertasStock.map((p) => ({
        id_producto:      Number(p.id_producto),
        titulo_producto:  p.titulo_producto,
        codigo_sku:       p.codigo_sku,
        stock_actual:     Number(p.stock_actual),
        stock_minimo:     Number(p.stock_minimo),
        nombre_categoria: p.nombre_categoria,
        nombre_formato:   p.nombre_formato,
      })),
      comprasPendientes: comprasPendientes.map((cp) => ({
        id_compra_proveedor:    Number(cp.id_compra_proveedor),
        fecha_compra_proveedor: String(cp.fecha_compra_proveedor),
        nombre_proveedor:       cp.nombre_proveedor,
        empleado:               cp.empleado,
        num_productos:          Number(cp.num_productos),
      })),
      ventasRecientes: ventasRecientes.map((v) => ({
        id_venta:     Number(v.id_venta),
        fecha_venta:  String(v.fecha_venta),
        estado_venta: v.estado_venta,
        metodo_pago:  v.metodo_pago,
        cliente:      v.cliente,
        total_neto:   v.total_neto,
      })),
    };
  }

  async getVentasDashboard() {
    const [
      [ventasHoyRow],
      [ventasMesRow],
      [totalMesRow],
      clientesActivos,
      productosDisponibles,
      ventasRecientes,
      productosMasVendidos,
      clientesRecientes,
    ] = await Promise.all([
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) AS total FROM venta WHERE fecha_venta = CURRENT_DATE
      `,
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) AS total
        FROM venta
        WHERE DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
      `,
      this.prisma.$queryRaw<Array<{ total: string }>>`
        SELECT COALESCE(
          SUM(dv.cantidad_vendida * dv.precio_unitario_venta), 0
        )::text AS total
        FROM detalle_venta dv
        JOIN venta v ON v.id_venta = dv.id_venta
        WHERE v.estado_venta = 'completada'
          AND DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
      `,
      this.prisma.cliente.count({ where: { estadoCliente: 'activo' } }),
      this.prisma.producto.count({
        where: { estadoProducto: 'activo', stockActual: { gt: 0 } },
      }),
      this.prisma.venta.findMany({
        take: 5,
        orderBy: { idVenta: 'desc' },
        select: {
          idVenta: true,
          fechaVenta: true,
          estadoVenta: true,
          metodoPago: true,
          cliente: { select: { nombreCliente: true, apellidoCliente: true } },
        },
      }),
      this.prisma.$queryRaw<
        Array<{
          id_producto: number;
          titulo_producto: string;
          total_vendido: string;
        }>
      >`
        SELECT dv.id_producto, p.titulo_producto,
               SUM(dv.cantidad_vendida)::text AS total_vendido
        FROM detalle_venta dv
        JOIN producto p ON p.id_producto = dv.id_producto
        GROUP BY dv.id_producto, p.titulo_producto
        ORDER BY SUM(dv.cantidad_vendida) DESC
        LIMIT 5
      `,
      this.prisma.cliente.findMany({
        take: 5,
        orderBy: { idCliente: 'desc' },
        select: {
          idCliente: true,
          nombreCliente: true,
          apellidoCliente: true,
          correoCliente: true,
          estadoCliente: true,
          fechaRegistroCliente: true,
        },
      }),
    ]);

    return {
      stats: {
        ventasHoy: Number(ventasHoyRow?.total ?? 0),
        ventasMes: Number(ventasMesRow?.total ?? 0),
        totalVendidoMes: Number(totalMesRow?.total ?? 0),
        clientesActivos,
        productosDisponibles,
      },
      recentItems: {
        ventasRecientes: ventasRecientes.map((v) => ({
          idVenta: v.idVenta,
          fecha: v.fechaVenta,
          estado: v.estadoVenta,
          metodoPago: v.metodoPago,
          cliente: `${v.cliente.nombreCliente} ${v.cliente.apellidoCliente}`,
        })),
        productosMasVendidos: productosMasVendidos.map((p) => ({
          idProducto: Number(p.id_producto),
          titulo: p.titulo_producto,
          totalVendido: Number(p.total_vendido),
        })),
        clientesRecientes: clientesRecientes.map((c) => ({
          idCliente: c.idCliente,
          nombre: `${c.nombreCliente} ${c.apellidoCliente}`,
          correo: c.correoCliente,
          estado: c.estadoCliente,
          fechaRegistro: c.fechaRegistroCliente,
        })),
      },
    };
  }

  async getInventarioDashboard() {
    const [
      productosActivos,
      productosAgotados,
      proveedoresActivos,
      recepcionesPendientes,
      [stockCriticoRow],
      stockCriticoItems,
      recepcionesRecientes,
      productosRecientes,
    ] = await Promise.all([
      this.prisma.producto.count({ where: { estadoProducto: 'activo' } }),
      this.prisma.producto.count({ where: { estadoProducto: 'agotado' } }),
      this.prisma.proveedor.count({ where: { estadoProveedor: 'activo' } }),
      this.prisma.compraProveedor.count({
        where: { estadoCompra: { in: ['pendiente', 'parcial'] } },
      }),
      this.prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*) AS total
        FROM producto
        WHERE estado_producto = 'activo' AND stock_actual <= stock_minimo
      `,
      this.prisma.$queryRaw<
        Array<{
          id_producto: number;
          titulo_producto: string;
          stock_actual: number;
          stock_minimo: number;
        }>
      >`
        SELECT id_producto, titulo_producto, stock_actual, stock_minimo
        FROM producto
        WHERE estado_producto = 'activo' AND stock_actual <= stock_minimo
        ORDER BY stock_actual ASC
        LIMIT 8
      `,
      this.prisma.compraProveedor.findMany({
        take: 5,
        where: { estadoCompra: { in: ['pendiente', 'parcial'] } },
        orderBy: { fechaCompraProveedor: 'desc' },
        select: {
          idCompraProveedor: true,
          fechaCompraProveedor: true,
          estadoCompra: true,
          proveedor: { select: { nombreProveedor: true } },
        },
      }),
      this.prisma.producto.findMany({
        take: 5,
        where: { estadoProducto: 'activo' },
        orderBy: { idProducto: 'desc' },
        select: {
          idProducto: true,
          tituloProducto: true,
          codigoSku: true,
          stockActual: true,
          precioVenta: true,
        },
      }),
    ]);

    return {
      stats: {
        productosActivos,
        stockCritico: Number(stockCriticoRow?.total ?? 0),
        productosAgotados,
        proveedoresActivos,
        recepcionesPendientes,
      },
      recentItems: {
        stockCriticoItems: stockCriticoItems.map((p) => ({
          idProducto: Number(p.id_producto),
          titulo: p.titulo_producto,
          stockActual: Number(p.stock_actual),
          stockMinimo: Number(p.stock_minimo),
        })),
        recepcionesRecientes: recepcionesRecientes.map((r) => ({
          idCompra: r.idCompraProveedor,
          fecha: r.fechaCompraProveedor,
          estado: r.estadoCompra,
          proveedor: r.proveedor?.nombreProveedor ?? null,
        })),
        productosRecientes: productosRecientes.map((p) => ({
          idProducto: p.idProducto,
          titulo: p.tituloProducto,
          sku: p.codigoSku,
          stockActual: p.stockActual,
          precioVenta: Number(p.precioVenta),
        })),
      },
    };
  }

  async getProveedorDashboard(idProveedor: number | null) {
    if (!idProveedor) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un proveedor asociado',
      );
    }

    const [
      productosAsociados,
      entregasPendientes,
      entregasRecibidas,
      entregasParciales,
      entregasRecientes,
      productosDestacados,
    ] = await Promise.all([
      this.prisma.productoProveedor.count({ where: { idProveedor } }),
      this.prisma.compraProveedor.count({
        where: { idProveedor, estadoCompra: 'pendiente' },
      }),
      this.prisma.compraProveedor.count({
        where: { idProveedor, estadoCompra: 'recibida' },
      }),
      this.prisma.compraProveedor.count({
        where: { idProveedor, estadoCompra: 'parcial' },
      }),
      this.prisma.compraProveedor.findMany({
        take: 5,
        where: { idProveedor },
        orderBy: { fechaCompraProveedor: 'desc' },
        select: {
          idCompraProveedor: true,
          fechaCompraProveedor: true,
          estadoCompra: true,
          detalles: {
            select: {
              cantidadComprada: true,
              cantidadRecibida: true,
              producto: {
                select: { tituloProducto: true, codigoSku: true },
              },
            },
          },
        },
      }),
      this.prisma.producto.findMany({
        take: 5,
        where: {
          productosProveedor: { some: { idProveedor } },
          estadoProducto: 'activo',
        },
        orderBy: { stockActual: 'asc' },
        select: {
          idProducto: true,
          tituloProducto: true,
          codigoSku: true,
          stockActual: true,
          stockMinimo: true,
          precioVenta: true,
        },
      }),
    ]);

    return {
      stats: {
        productosAsociados,
        entregasPendientes,
        entregasRecibidas,
        entregasParciales,
      },
      recentItems: {
        entregasRecientes: entregasRecientes.map((e) => ({
          idCompra: e.idCompraProveedor,
          fecha: e.fechaCompraProveedor,
          estado: e.estadoCompra,
          detalles: e.detalles.map((d) => ({
            titulo: d.producto.tituloProducto,
            sku: d.producto.codigoSku,
            cantidadComprada: d.cantidadComprada,
            cantidadRecibida: d.cantidadRecibida,
          })),
        })),
        productosDestacados: productosDestacados.map((p) => ({
          idProducto: p.idProducto,
          titulo: p.tituloProducto,
          sku: p.codigoSku,
          stockActual: p.stockActual,
          stockMinimo: p.stockMinimo,
          precioVenta: Number(p.precioVenta),
        })),
      },
    };
  }
}

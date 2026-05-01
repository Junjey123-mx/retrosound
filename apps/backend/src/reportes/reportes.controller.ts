import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // JOIN múltiple (1/3): venta → cliente, empleado, detalle_venta → producto
  @Get('ventas-detalle')
  ventasDetalle() {
    return this.reportesService.ventasDetalle();
  }

  // JOIN múltiple (2/3): producto → categoria, formato, artistas, géneros
  @Get('productos-catalogo')
  productosCatalogo() {
    return this.reportesService.productosCatalogo();
  }

  // JOIN múltiple (3/3): compra_proveedor → proveedor, empleado → detalle → producto
  @Get('compras-proveedor')
  comprasProveedor() {
    return this.reportesService.comprasProveedor();
  }

  // Subquery escalar en FROM: productos con stock ≤ promedio general
  @Get('productos-bajo-stock')
  productosStockBajo() {
    return this.reportesService.productosStockBajo();
  }

  // Subquery EXISTS + subquery correlacionado: clientes con ventas completadas
  @Get('clientes-frecuentes')
  clientesFrecuentes() {
    return this.reportesService.clientesFrecuentes();
  }

  // GROUP BY + HAVING + SUM / COUNT / AVG: productos más vendidos
  // ?min=N → filtra los que tengan ≥ N unidades vendidas (default 1)
  @Get('productos-mas-vendidos')
  productosMasVendidos(@Query('min') min?: string) {
    return this.reportesService.productosMasVendidos(Number(min) || 1);
  }

  // CTE (WITH) + DENSE_RANK(): ranking de productos por ingresos
  @Get('ranking-ingresos')
  rankingIngresos() {
    return this.reportesService.rankingIngresos();
  }

  // VIEW vista_resumen_ventas: resumen de ventas con totales
  // ?estado=completada|pendiente|cancelada (opcional)
  @Get('resumen-ventas')
  resumenVentas(@Query('estado') estado?: string) {
    return this.reportesService.resumenVentas(estado);
  }
}

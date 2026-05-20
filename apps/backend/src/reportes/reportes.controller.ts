import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportesService } from './reportes.service';
import { ReporteQueryDto } from './dto/reporte-query.dto';
import { ExportReporteDto } from './dto/export-reporte.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // ── Endpoints principales ──────────────────────────────────────────────────

  @Get('resumen-ventas')
  @Roles('admin', 'empleado_ventas')
  resumenVentas(@Query() query: ReporteQueryDto) {
    return this.reportesService.resumenVentas(query.estado);
  }

  @Get('ventas-detalle')
  @Roles('admin', 'empleado_ventas')
  ventasDetalle(@Query() query: ReporteQueryDto) {
    return this.reportesService.ventasDetalle(query);
  }

  @Get('catalogo')
  @Roles('admin')
  catalogo(@Query() query: ReporteQueryDto) {
    return this.reportesService.productosCatalogo(query);
  }

  @Get('compras')
  @Roles('admin')
  compras() {
    return this.reportesService.comprasProveedor();
  }

  @Get('stock-bajo')
  @Roles('admin')
  stockBajo() {
    return this.reportesService.productosStockBajo();
  }

  @Get('clientes-frecuentes')
  @Roles('admin', 'empleado_ventas')
  clientesFrecuentes(@Query() query: ReporteQueryDto) {
    return this.reportesService.clientesFrecuentes(query);
  }

  @Get('mas-vendidos')
  @Roles('admin', 'empleado_ventas')
  masVendidos(@Query() query: ReporteQueryDto) {
    return this.reportesService.productosMasVendidos(query.min ?? 1);
  }

  @Get('ranking-ingresos')
  @Roles('admin', 'empleado_ventas')
  rankingIngresos() {
    return this.reportesService.rankingIngresos();
  }

  @Get('export/csv')
  @Roles('admin', 'empleado_ventas')
  async exportCsv(@Query() dto: ExportReporteDto, @Res() res: Response) {
    const { csv, filename } = await this.reportesService.exportCsv(dto);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  // ── Rutas legacy (compatibilidad hacia atrás) ───────────────────────────────

  @Get('productos-catalogo')
  @Roles('admin')
  productosCatalogo(@Query() query: ReporteQueryDto) {
    return this.reportesService.productosCatalogo(query);
  }

  @Get('compras-proveedor')
  @Roles('admin')
  comprasProveedor() {
    return this.reportesService.comprasProveedor();
  }

  @Get('productos-bajo-stock')
  @Roles('admin')
  productosStockBajo() {
    return this.reportesService.productosStockBajo();
  }

  @Get('productos-mas-vendidos')
  @Roles('admin', 'empleado_ventas')
  productosMasVendidos(@Query('min') min?: string) {
    return this.reportesService.productosMasVendidos(Number(min) || 1);
  }

  @Get('dashboard')
  @Roles('admin', 'empleado_ventas')
  getDashboard() {
    return this.reportesService.getDashboard();
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

type AuthUser = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('admin')
  getAdmin() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('ventas')
  @Roles('admin', 'empleado_ventas')
  getVentas() {
    return this.dashboardService.getVentasDashboard();
  }

  @Get('inventario')
  @Roles('admin', 'empleado_inventario')
  getInventario() {
    return this.dashboardService.getInventarioDashboard();
  }

  @Get('proveedor')
  @Roles('proveedor')
  getProveedor(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getProveedorDashboard(user.idProveedor);
  }
}

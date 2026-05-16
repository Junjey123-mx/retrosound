import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProveedorPortalService } from './proveedor-portal.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';

type AuthUser = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('proveedor')
@Controller('proveedor/me')
export class ProveedorPortalController {
  constructor(private readonly proveedorPortalService: ProveedorPortalService) {}

  @Post('entregas')
  registrarEntrega(
    @Body() dto: RegistrarEntregaProveedorDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.registrarEntrega(dto, user.idProveedor);
  }
}

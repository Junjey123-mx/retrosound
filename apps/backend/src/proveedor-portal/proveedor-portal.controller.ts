import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProveedorPortalService } from './proveedor-portal.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';
import { UpdateProductoImagenDto } from '../productos/dto/update-producto-imagen.dto';

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

  @Patch('productos/:id/imagen')
  updateProductoImagen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoImagenDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.updateProductoImagen(
      id,
      dto,
      user.idProveedor,
    );
  }
}

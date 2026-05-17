import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProveedorPortalService } from './proveedor-portal.service';
import { RegistrarEntregaProveedorDto } from './dto/registrar-entrega-proveedor.dto';
import { UpdateProductoImagenDto } from '../productos/dto/update-producto-imagen.dto';
import { FindProveedorProductosDto } from './dto/find-proveedor-productos.dto';
import { FindProveedorEntregasDto } from './dto/find-proveedor-entregas.dto';
import { UpdateProveedorProductoDto } from './dto/update-proveedor-producto.dto';
import { UpdateProveedorPerfilDto } from './dto/update-proveedor-perfil.dto';

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

  @Get()
  getMe(@CurrentUser() user: AuthUser) {
    return this.proveedorPortalService.getMe(user.idProveedor);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.proveedorPortalService.getDashboard(user.idProveedor);
  }

  @Get('productos')
  getProductos(
    @Query() dto: FindProveedorProductosDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.getProductos(user.idProveedor, dto);
  }

  @Get('productos/:id')
  getProducto(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.getProducto(user.idProveedor, id);
  }

  @Patch('productos/:id')
  updateProducto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorProductoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.updateProducto(user.idProveedor, id, dto);
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

  @Get('entregas')
  getEntregas(
    @Query() dto: FindProveedorEntregasDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.getEntregas(user.idProveedor, dto);
  }

  @Get('entregas/:id')
  getEntrega(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.getEntrega(user.idProveedor, id);
  }

  @Post('entregas')
  registrarEntrega(
    @Body() dto: RegistrarEntregaProveedorDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.registrarEntrega(dto, user.idProveedor);
  }

  @Get('perfil')
  getPerfil(@CurrentUser() user: AuthUser) {
    return this.proveedorPortalService.getPerfil(user.idProveedor);
  }

  @Patch('perfil')
  updatePerfil(
    @Body() dto: UpdateProveedorPerfilDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.proveedorPortalService.updatePerfil(user.idProveedor, dto);
  }
}

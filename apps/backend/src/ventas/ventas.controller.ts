import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';

type AuthUser = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'empleado_ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVentaDto, @CurrentUser() user: AuthUser) {
    return this.ventasService.create(dto, user.idEmpleado);
  }
}

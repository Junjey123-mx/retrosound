import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InventarioService } from './inventario.service';
import { ConfirmarRecepcionDto } from './dto/confirmar-recepcion.dto';
import { StockQueryDto } from './dto/stock-query.dto';

type AuthUser = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'empleado_inventario')
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('recepciones')
  findRecepciones(@Query() query: StockQueryDto) {
    return this.inventarioService.findRecepciones(query);
  }

  @Get('recepciones/:id')
  findRecepcionById(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findRecepcionById(id);
  }

  @Patch('recepciones/:id/confirmar')
  confirmarRecepcion(
    @Param('id', ParseIntPipe) idDetalle: number,
    @Body() dto: ConfirmarRecepcionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventarioService.confirmarRecepcion(
      idDetalle,
      dto,
      user.idEmpleado,
    );
  }

  @Get('stock-critico')
  findStockCritico(@Query() query: StockQueryDto) {
    return this.inventarioService.findStockCritico(query);
  }

  @Get('stock-resumen')
  findStockResumen() {
    return this.inventarioService.findStockResumen();
  }
}

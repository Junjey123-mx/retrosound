import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MisOrdenesService } from './mis-ordenes.service';

type ClienteToken = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cliente')
@Controller('mis-ordenes')
export class MisOrdenesController {
  constructor(private readonly misOrdenesService: MisOrdenesService) {}

  @Get()
  getMisOrdenes(@CurrentUser() user: ClienteToken) {
    return this.misOrdenesService.findByUsuario(user.id);
  }

  @Get(':id')
  getOrden(
    @CurrentUser() user: ClienteToken,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.misOrdenesService.findById(user.idCliente, id);
  }
}

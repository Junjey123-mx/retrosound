import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MisOrdenesService } from './mis-ordenes.service';

type UsuarioToken = { id: number; correo: string; rol: string };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cliente')
@Controller('mis-ordenes')
export class MisOrdenesController {
  constructor(private readonly misOrdenesService: MisOrdenesService) {}

  // GET /mis-ordenes
  // Devuelve solo las ventas del cliente autenticado.
  @Get()
  getMisOrdenes(@CurrentUser() user: UsuarioToken) {
    return this.misOrdenesService.findByUsuario(user.id);
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

type UsuarioToken = { id: number; correo: string; rol: string };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cliente')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  // POST /checkout
  // Convierte el carrito activo en una venta real.
  // Requiere JWT con rol=cliente.
  // idCliente se resuelve desde el token — no se acepta en el body.
  @Post()
  checkout(
    @CurrentUser() user: UsuarioToken,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.checkoutService.checkout(user.id, dto);
  }
}

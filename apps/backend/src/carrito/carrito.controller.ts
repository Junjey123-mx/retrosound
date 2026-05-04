import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CarritoService } from './carrito.service';
import { AddCarritoItemDto } from './dto/add-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

type UsuarioToken = { id: number; correo: string; rol: string };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cliente')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  // GET /carrito
  // Devuelve el carrito activo con items y subtotales.
  // Respuesta vacía si el cliente no tiene carrito activo (no auto-crea).
  @Get()
  getCarrito(@CurrentUser() user: UsuarioToken) {
    return this.carritoService.getCarrito(user.id);
  }

  // POST /carrito/items
  // Agrega un producto al carrito. Si no hay carrito activo, lo crea.
  // Si el producto ya está en el carrito, acumula la cantidad.
  @Post('items')
  addItem(
    @CurrentUser() user: UsuarioToken,
    @Body() dto: AddCarritoItemDto,
  ) {
    return this.carritoService.addItem(user.id, dto);
  }

  // PATCH /carrito/items/:id
  // Actualiza la cantidad de un item. El :id es id_carrito_item.
  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarritoItemDto,
  ) {
    return this.carritoService.updateItem(user.id, id, dto);
  }

  // DELETE /carrito/items/:id
  // Elimina un item del carrito. El :id es id_carrito_item.
  @Delete('items/:id')
  removeItem(
    @CurrentUser() user: UsuarioToken,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carritoService.removeItem(user.id, id);
  }

  // DELETE /carrito
  // Cancela el carrito activo y elimina sus items.
  @Delete()
  cancelarCarrito(@CurrentUser() user: UsuarioToken) {
    return this.carritoService.cancelarCarrito(user.id);
  }
}

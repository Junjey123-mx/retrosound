import {
  Body,
  Controller,
  Delete,
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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { FindAllClientesDto } from './dto/find-all-clientes.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { UpdateClienteMeDto } from './dto/update-cliente-me.dto';

type ClienteToken = {
  id: number;
  correo: string;
  rol: string;
  idCliente: number | null;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'empleado_ventas')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // ── Rutas de cliente autenticado (deben ir antes de :id) ──────────────────

  @Get('me')
  @Roles('cliente')
  getMe(@CurrentUser() user: ClienteToken) {
    return this.clientesService.getMyProfile(user.idCliente);
  }

  @Patch('me')
  @Roles('cliente')
  updateMe(
    @CurrentUser() user: ClienteToken,
    @Body() dto: UpdateClienteMeDto,
  ) {
    return this.clientesService.updateMyProfile(user.idCliente, dto);
  }

  // ── Rutas administrativas ─────────────────────────────────────────────────

  @Get()
  findAll(@Query() query: FindAllClientesDto) {
    return this.clientesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}

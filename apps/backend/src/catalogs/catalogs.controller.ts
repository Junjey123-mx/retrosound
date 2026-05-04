import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  // GETs públicos: datos de referencia necesarios para el catálogo de la tienda
  @Get('categorias')
  getCategorias() {
    return this.catalogsService.getCategorias();
  }

  @Get('formatos')
  getFormatos() {
    return this.catalogsService.getFormatos();
  }

  @Get('generos')
  getGeneros() {
    return this.catalogsService.getGeneros();
  }

  @Get('artistas')
  getArtistas() {
    return this.catalogsService.getArtistas();
  }

  // POSTs administrativos: solo admin o empleado pueden crear catálogos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'empleado')
  @Post('categorias')
  createCategoria(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createCategoria(body.nombre, body.descripcion);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'empleado')
  @Post('formatos')
  createFormato(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createFormato(body.nombre, body.descripcion);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'empleado')
  @Post('generos')
  createGenero(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createGenero(body.nombre, body.descripcion);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'empleado')
  @Post('artistas')
  createArtista(
    @Body() body: { nombre: string; paisOrigen?: string; anioInicio?: number },
  ) {
    return this.catalogsService.createArtista(body);
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogsService } from './catalogs.service';

@UseGuards(JwtAuthGuard)
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('categorias')
  getCategorias() { return this.catalogsService.getCategorias(); }

  @Get('formatos')
  getFormatos() { return this.catalogsService.getFormatos(); }

  @Get('generos')
  getGeneros() { return this.catalogsService.getGeneros(); }

  @Get('artistas')
  getArtistas() { return this.catalogsService.getArtistas(); }

  @Post('categorias')
  createCategoria(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createCategoria(body.nombre, body.descripcion);
  }

  @Post('formatos')
  createFormato(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createFormato(body.nombre, body.descripcion);
  }

  @Post('generos')
  createGenero(@Body() body: { nombre: string; descripcion?: string }) {
    return this.catalogsService.createGenero(body.nombre, body.descripcion);
  }

  @Post('artistas')
  createArtista(@Body() body: { nombre: string; paisOrigen?: string; anioInicio?: number }) {
    return this.catalogsService.createArtista(body);
  }
}

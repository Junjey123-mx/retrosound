import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  getCategorias() { return this.prisma.categoria.findMany({ where: { estado: 'activo' } }); }
  getFormatos()   { return this.prisma.formato.findMany({ where: { estado: 'activo' } }); }
  getGeneros()    { return this.prisma.generoMusical.findMany({ where: { estado: 'activo' } }); }
  getArtistas()   { return this.prisma.artista.findMany({ where: { estado: 'activo' } }); }

  createCategoria(nombre: string, descripcion?: string) {
    return this.prisma.categoria.create({ data: { nombre, descripcion } });
  }

  createFormato(nombre: string, descripcion?: string) {
    return this.prisma.formato.create({ data: { nombre, descripcion } });
  }

  createGenero(nombre: string, descripcion?: string) {
    return this.prisma.generoMusical.create({ data: { nombre, descripcion } });
  }

  createArtista(data: { nombre: string; paisOrigen?: string; anioInicio?: number }) {
    return this.prisma.artista.create({ data });
  }
}

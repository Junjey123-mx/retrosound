import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.producto.findMany({
      where: { estado: { not: 'descontinuado' } },
      include: {
        categoria: true,
        formato: true,
        artistas: { include: { artista: true } },
        generos: { include: { generoMusical: true } },
      },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        formato: true,
        artistas: { include: { artista: true } },
        generos: { include: { generoMusical: true } },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async create(dto: CreateProductoDto) {
    const { artistaIds, generoIds, ...data } = dto;
    return this.prisma.producto.create({
      data: {
        ...data,
        precioVenta: data.precioVenta,
        artistas: artistaIds
          ? { create: artistaIds.map((id) => ({ idArtista: id })) }
          : undefined,
        generos: generoIds
          ? { create: generoIds.map((id) => ({ idGeneroMusical: id })) }
          : undefined,
      },
    });
  }

  async update(id: number, dto: Partial<CreateProductoDto>) {
    await this.findOne(id);
    const { artistaIds, generoIds, ...data } = dto;
    return this.prisma.producto.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { estado: 'descontinuado', fechaInactivacion: new Date() },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cliente.findMany({ where: { estado: 'activo' } });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        telefono: dto.telefono,
        correo: dto.correo,
        direccion: dto.direccion,
        fechaRegistro: new Date(dto.fechaRegistro),
      },
    });
  }

  async update(id: number, dto: Partial<CreateClienteDto>) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data: { estado: 'inactivo', fechaInactivacion: new Date() },
    });
  }
}

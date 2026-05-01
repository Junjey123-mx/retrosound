import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.empleado.findMany({ where: { estado: 'activo' } });
  }

  async findOne(id: number) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id } });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return empleado;
  }

  create(dto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        telefono: dto.telefono,
        correo: dto.correo,
        fechaContratacion: new Date(dto.fechaContratacion),
      },
    });
  }

  async update(id: number, dto: Partial<CreateEmpleadoDto>) {
    await this.findOne(id);
    return this.prisma.empleado.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.empleado.update({
      where: { id },
      data: { estado: 'inactivo', fechaInactivacion: new Date() },
    });
  }
}

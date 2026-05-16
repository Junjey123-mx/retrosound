import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { FindAllEmpleadosDto } from './dto/find-all-empleados.dto';
import { LinkEmpleadoUserDto } from './dto/link-empleado-user.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { UpdateEmpleadoStatusDto } from './dto/update-empleado-status.dto';

const INCLUDE_EMPLEADO = {
  usuario: {
    select: {
      idUsuario: true,
      correoUsuario: true,
      rolUsuario: true,
      estadoUsuario: true,
    },
  },
} satisfies Prisma.EmpleadoInclude;

type EmpleadoConUsuario = Prisma.EmpleadoGetPayload<{
  include: typeof INCLUDE_EMPLEADO;
}>;

type EmpleadoBase = {
  idEmpleado: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  telefonoEmpleado: string | null;
  correoEmpleado: string | null;
  fechaContratacion: Date;
  estadoEmpleado: string;
  fechaInactivacion: Date | null;
};

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindAllEmpleadosDto = {}) {
    const { search, estado, page = 1, limit = 20 } = query;

    const where: Prisma.EmpleadoWhereInput = {};
    if (search) {
      where.OR = [
        { nombreEmpleado: { contains: search, mode: 'insensitive' } },
        { apellidoEmpleado: { contains: search, mode: 'insensitive' } },
        { correoEmpleado: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (estado) where.estadoEmpleado = estado;

    const skip = (page - 1) * limit;

    const [empleados, total] = await Promise.all([
      this.prisma.empleado.findMany({
        where,
        skip,
        take: limit,
        orderBy: { idEmpleado: 'asc' },
        include: INCLUDE_EMPLEADO,
      }),
      this.prisma.empleado.count({ where }),
    ]);

    return {
      data: empleados.map((e) => this.mapEmpleadoConUsuario(e)),
      total,
      page,
      limit,
    };
  }

  // Not exposed by controller; ready for a future GET /empleados/stats endpoint.
  async stats() {
    const [total, activos, inactivos, conUsuario, ventas, inventario] =
      await Promise.all([
        this.prisma.empleado.count(),
        this.prisma.empleado.count({ where: { estadoEmpleado: 'activo' } }),
        this.prisma.empleado.count({ where: { estadoEmpleado: 'inactivo' } }),
        this.prisma.usuario.count({ where: { idEmpleado: { not: null } } }),
        this.prisma.empleado.count({
          where: { usuario: { rolUsuario: 'empleado_ventas' } },
        }),
        this.prisma.empleado.count({
          where: { usuario: { rolUsuario: 'empleado_inventario' } },
        }),
      ]);

    return {
      total,
      activos,
      inactivos,
      ventas,
      inventario,
      conUsuario,
      sinUsuario: total - conUsuario,
    };
  }

  async findOne(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado: id },
      include: INCLUDE_EMPLEADO,
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return this.mapEmpleadoConUsuario(empleado);
  }

  async create(dto: CreateEmpleadoDto) {
    const empleado = await this.prisma.empleado.create({
      data: {
        nombreEmpleado: dto.nombre,
        apellidoEmpleado: dto.apellido,
        telefonoEmpleado: dto.telefono ?? null,
        correoEmpleado: dto.correo ?? null,
        fechaContratacion: new Date(dto.fechaContratacion),
      },
    });
    return this.mapEmpleadoBase(empleado);
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.findOne(id);

    const data: Prisma.EmpleadoUpdateInput = {};
    if (dto.nombre !== undefined) data.nombreEmpleado = dto.nombre;
    if (dto.apellido !== undefined) data.apellidoEmpleado = dto.apellido;
    if (dto.telefono !== undefined) data.telefonoEmpleado = dto.telefono;
    if (dto.correo !== undefined) data.correoEmpleado = dto.correo;
    if (dto.fechaContratacion !== undefined) {
      data.fechaContratacion = new Date(dto.fechaContratacion);
    }

    if (Object.keys(data).length === 0) return this.findOne(id);

    const empleado = await this.prisma.empleado.update({
      where: { idEmpleado: id },
      data,
    });
    return this.mapEmpleadoBase(empleado);
  }

  // Not exposed by controller; ready for a future PATCH /empleados/:id/status endpoint.
  async updateStatus(id: number, dto: UpdateEmpleadoStatusDto) {
    await this.findOne(id);
    const empleado = await this.prisma.empleado.update({
      where: { idEmpleado: id },
      data: {
        estadoEmpleado: dto.estado,
        fechaInactivacion: dto.estado === 'inactivo' ? new Date() : null,
      },
    });
    return this.mapEmpleadoBase(empleado);
  }

  // Not exposed by controller; ready for a future POST /empleados/:id/link-user endpoint.
  async linkUser(id: number, dto: LinkEmpleadoUserDto) {
    await this.findOne(id);

    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: dto.idUsuario },
      select: { idUsuario: true, rolUsuario: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (
      usuario.rolUsuario !== 'empleado_ventas' &&
      usuario.rolUsuario !== 'empleado_inventario'
    ) {
      throw new BadRequestException(
        'El usuario debe tener rol empleado_ventas o empleado_inventario',
      );
    }

    await this.prisma.usuario.update({
      where: { idUsuario: dto.idUsuario },
      data: { idEmpleado: id },
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const empleado = await this.prisma.empleado.update({
      where: { idEmpleado: id },
      data: {
        estadoEmpleado: 'inactivo',
        fechaInactivacion: new Date(),
      },
    });
    return this.mapEmpleadoBase(empleado);
  }

  private mapEmpleadoBase(e: EmpleadoBase) {
    return {
      id: e.idEmpleado,
      nombre: e.nombreEmpleado,
      apellido: e.apellidoEmpleado,
      telefono: e.telefonoEmpleado,
      correo: e.correoEmpleado,
      fechaContratacion: e.fechaContratacion,
      estado: e.estadoEmpleado,
      fechaInactivacion: e.fechaInactivacion,
    };
  }

  private mapEmpleadoConUsuario(e: EmpleadoConUsuario) {
    return {
      ...this.mapEmpleadoBase(e),
      usuario: e.usuario
        ? {
            id: e.usuario.idUsuario,
            correo: e.usuario.correoUsuario,
            rol: e.usuario.rolUsuario,
            estado: e.usuario.estadoUsuario,
          }
        : null,
    };
  }
}

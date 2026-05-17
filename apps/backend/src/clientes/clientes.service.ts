import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { FindAllClientesDto } from './dto/find-all-clientes.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { UpdateClienteStatusDto } from './dto/update-cliente-status.dto';
import { UpdateClienteMeDto } from './dto/update-cliente-me.dto';

const INCLUDE_CLIENTE = {
  usuario: {
    select: {
      idUsuario: true,
      correoUsuario: true,
      rolUsuario: true,
      estadoUsuario: true,
    },
  },
} satisfies Prisma.ClienteInclude;

const INCLUDE_CLIENTE_DETAIL = {
  usuario: {
    select: {
      idUsuario: true,
      correoUsuario: true,
      rolUsuario: true,
      estadoUsuario: true,
    },
  },
  _count: { select: { ventas: true } },
} satisfies Prisma.ClienteInclude;

type ClienteConUsuario = Prisma.ClienteGetPayload<{
  include: typeof INCLUDE_CLIENTE;
}>;

type ClienteConDetalle = Prisma.ClienteGetPayload<{
  include: typeof INCLUDE_CLIENTE_DETAIL;
}>;

type ClienteBase = {
  idCliente: number;
  nombreCliente: string;
  apellidoCliente: string;
  telefonoCliente: string | null;
  correoCliente: string | null;
  direccionCliente: string | null;
  fechaRegistroCliente: Date;
  estadoCliente: string;
  fechaInactivacion: Date | null;
};

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindAllClientesDto = {}) {
    const { search, estado, page = 1, limit = 20 } = query;

    const where: Prisma.ClienteWhereInput = {};
    if (search) {
      where.OR = [
        { nombreCliente: { contains: search, mode: 'insensitive' } },
        { apellidoCliente: { contains: search, mode: 'insensitive' } },
        { correoCliente: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (estado) where.estadoCliente = estado;

    const skip = (page - 1) * limit;

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { idCliente: 'asc' },
        include: INCLUDE_CLIENTE,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes.map((c) => this.mapClienteConUsuario(c)),
      total,
      page,
      limit,
    };
  }

  // Not exposed by controller; ready for a future GET /clientes/stats endpoint.
  async stats() {
    const [total, activos, inactivos, conUsuario] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cliente.count({ where: { estadoCliente: 'activo' } }),
      this.prisma.cliente.count({ where: { estadoCliente: 'inactivo' } }),
      this.prisma.usuario.count({ where: { idCliente: { not: null } } }),
    ]);

    return {
      total,
      activos,
      inactivos,
      conUsuario,
      sinUsuario: total - conUsuario,
    };
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { idCliente: id },
      include: INCLUDE_CLIENTE_DETAIL,
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return this.mapClienteDetalle(cliente);
  }

  async create(dto: CreateClienteDto) {
    const cliente = await this.prisma.cliente.create({
      data: {
        nombreCliente: dto.nombre,
        apellidoCliente: dto.apellido,
        telefonoCliente: dto.telefono ?? null,
        correoCliente: dto.correo ?? null,
        direccionCliente: dto.direccion ?? null,
        fechaRegistroCliente: new Date(dto.fechaRegistro),
      },
    });
    return this.mapClienteBase(cliente);
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);

    const data: Prisma.ClienteUpdateInput = {};
    if (dto.nombre !== undefined) data.nombreCliente = dto.nombre;
    if (dto.apellido !== undefined) data.apellidoCliente = dto.apellido;
    if (dto.telefono !== undefined) data.telefonoCliente = dto.telefono;
    if (dto.correo !== undefined) data.correoCliente = dto.correo;
    if (dto.direccion !== undefined) data.direccionCliente = dto.direccion;
    if (dto.fechaRegistro !== undefined) {
      data.fechaRegistroCliente = new Date(dto.fechaRegistro);
    }

    if (Object.keys(data).length === 0) return this.findOne(id);

    const cliente = await this.prisma.cliente.update({
      where: { idCliente: id },
      data,
    });
    return this.mapClienteBase(cliente);
  }

  // Not exposed by controller; ready for a future PATCH /clientes/:id/status endpoint.
  async updateStatus(id: number, dto: UpdateClienteStatusDto) {
    await this.findOne(id);
    const cliente = await this.prisma.cliente.update({
      where: { idCliente: id },
      data: {
        estadoCliente: dto.estado,
        fechaInactivacion: dto.estado === 'inactivo' ? new Date() : null,
      },
    });
    return this.mapClienteBase(cliente);
  }

  // Not exposed by controller; ready for a future GET /clientes/:id/ventas endpoint.
  async findVentasByCliente(id: number) {
    await this.findOne(id);
    const ventas = await this.prisma.venta.findMany({
      where: { idCliente: id },
      orderBy: { fechaVenta: 'desc' },
      include: { detalles: true },
    });

    return ventas.map((v) => {
      const subtotal = v.detalles.reduce(
        (sum, d) =>
          sum +
          Number(d.precioUnitarioVenta) * d.cantidadVendida -
          Number(d.descuentoDetalle),
        0,
      );
      const total = subtotal - Number(v.descuentoVenta);
      return {
        id: v.idVenta,
        fecha: v.fechaVenta,
        estado: v.estadoVenta,
        metodoPago: v.metodoPago,
        subtotal,
        iva: 0,
        total,
        cantidadProductos: v.detalles.length,
      };
    });
  }

  // Not exposed by controller; ready for a future GET /perfil endpoint.
  async me(idUsuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario },
      select: { idCliente: true },
    });
    if (!usuario?.idCliente) {
      throw new NotFoundException('No hay cliente asociado a este usuario');
    }
    return this.findOne(usuario.idCliente);
  }

  // Not exposed by controller; ready for a future PATCH /perfil endpoint.
  async updateMe(idUsuario: number, dto: UpdateClienteDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario },
      select: { idCliente: true },
    });
    if (!usuario?.idCliente) {
      throw new NotFoundException('No hay cliente asociado a este usuario');
    }
    const safeDto: UpdateClienteDto = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      correo: dto.correo,
      direccion: dto.direccion,
      // fechaRegistro excluido: campo administrativo
    };
    return this.update(usuario.idCliente, safeDto);
  }

  async getMyProfile(idCliente: number | null) {
    if (!idCliente) {
      throw new ForbiddenException('El usuario no tiene un perfil de cliente asociado');
    }
    return this.findOne(idCliente);
  }

  async updateMyProfile(idCliente: number | null, dto: UpdateClienteMeDto) {
    if (!idCliente) {
      throw new ForbiddenException('El usuario no tiene un perfil de cliente asociado');
    }
    const data: Prisma.ClienteUpdateInput = {};
    if (dto.nombre !== undefined)    data.nombreCliente    = dto.nombre;
    if (dto.apellido !== undefined)  data.apellidoCliente  = dto.apellido;
    if (dto.telefono !== undefined)  data.telefonoCliente  = dto.telefono;
    if (dto.direccion !== undefined) data.direccionCliente = dto.direccion;

    if (Object.keys(data).length === 0) return this.findOne(idCliente);

    const cliente = await this.prisma.cliente.update({
      where: { idCliente },
      data,
    });
    return this.mapClienteBase(cliente);
  }

  async remove(id: number) {
    await this.findOne(id);
    const cliente = await this.prisma.cliente.update({
      where: { idCliente: id },
      data: {
        estadoCliente: 'inactivo',
        fechaInactivacion: new Date(),
      },
    });
    return this.mapClienteBase(cliente);
  }

  private mapClienteBase(c: ClienteBase) {
    return {
      id: c.idCliente,
      nombre: c.nombreCliente,
      apellido: c.apellidoCliente,
      telefono: c.telefonoCliente,
      correo: c.correoCliente,
      direccion: c.direccionCliente,
      fechaRegistro: c.fechaRegistroCliente,
      estado: c.estadoCliente,
      fechaInactivacion: c.fechaInactivacion,
    };
  }

  private mapClienteConUsuario(c: ClienteConUsuario) {
    return {
      ...this.mapClienteBase(c),
      usuario: c.usuario
        ? {
            id: c.usuario.idUsuario,
            correo: c.usuario.correoUsuario,
            rol: c.usuario.rolUsuario,
            estado: c.usuario.estadoUsuario,
          }
        : null,
    };
  }

  private mapClienteDetalle(c: ClienteConDetalle) {
    return {
      ...this.mapClienteConUsuario(c),
      totalVentas: c._count.ventas,
    };
  }
}

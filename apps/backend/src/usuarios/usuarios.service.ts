import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { FindAllUsuariosDto } from './dto/find-all-usuarios.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateUsuarioStatusDto } from './dto/update-usuario-status.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EstadoUsuario, RolUsuario } from './enums/usuario.enums';

const INCLUDE_USUARIO = {
  cliente: true,
  empleado: true,
  proveedor: true,
} satisfies Prisma.UsuarioInclude;

type UsuarioConRelaciones = Prisma.UsuarioGetPayload<{
  include: typeof INCLUDE_USUARIO;
}>;

type UsuarioRow = {
  idUsuario: number;
  correoUsuario: string;
  rolUsuario: string;
  estadoUsuario: string;
  fechaInactivacion: Date | null;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindAllUsuariosDto = {}) {
    const { search, rol, estado, page = 1, limit = 20 } = query;

    const where: Prisma.UsuarioWhereInput = {};
    if (search) where.correoUsuario = { contains: search, mode: 'insensitive' };
    if (rol) where.rolUsuario = rol;
    if (estado) where.estadoUsuario = estado;

    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { idUsuario: 'asc' },
        include: INCLUDE_USUARIO,
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: usuarios.map((u) => this.mapUsuarioDetalle(u)),
      total,
      page,
      limit,
    };
  }

  // Not exposed by controller; ready for a future GET /usuarios/stats endpoint.
  async stats() {
    const [
      total,
      activos,
      admins,
      empleadosVentas,
      empleadosInventario,
      clientes,
      proveedores,
    ] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.usuario.count({ where: { estadoUsuario: 'activo' } }),
      this.prisma.usuario.count({ where: { rolUsuario: 'admin' } }),
      this.prisma.usuario.count({ where: { rolUsuario: 'empleado_ventas' } }),
      this.prisma.usuario.count({ where: { rolUsuario: 'empleado_inventario' } }),
      this.prisma.usuario.count({ where: { rolUsuario: 'cliente' } }),
      this.prisma.usuario.count({ where: { rolUsuario: 'proveedor' } }),
    ]);

    return {
      total,
      activos,
      admins,
      empleados: empleadosVentas + empleadosInventario,
      clientes,
      proveedores,
    };
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
      include: INCLUDE_USUARIO,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return this.mapUsuarioDetalle(usuario);
  }

  async create(dto: CreateUsuarioDto) {
    const hash = await bcrypt.hash(dto.contrasena, 10);
    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          correoUsuario: dto.correo,
          contrasenaHash: hash,
          rolUsuario: dto.rol,
          estadoUsuario: 'activo',
        },
      });
      return this.mapUsuario(usuario);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const data: Prisma.UsuarioUpdateInput = {};
    if (dto.estado !== undefined) data.estadoUsuario = dto.estado;
    if (dto.rol !== undefined) data.rolUsuario = dto.rol;

    if (Object.keys(data).length === 0) return this.findOne(id);

    const usuario = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data,
    });
    return this.mapUsuario(usuario);
  }

  // Not exposed by controller; ready for a future PATCH /usuarios/:id/status endpoint.
  async updateStatus(id: number, dto: UpdateUsuarioStatusDto) {
    await this.findOne(id);
    const usuario = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: {
        estadoUsuario: dto.estado,
        fechaInactivacion:
          dto.estado === EstadoUsuario.INACTIVO ? new Date() : null,
      },
    });
    return this.mapUsuario(usuario);
  }

  // Not exposed by controller; ready for a future POST /usuarios/:id/reset-password endpoint.
  async resetPassword(id: number, dto: ResetPasswordDto) {
    await this.findOne(id);
    const hash = await bcrypt.hash(dto.contrasena, 10);
    await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { contrasenaHash: hash },
    });
    return { message: 'Contraseña actualizada' };
  }

  // Not exposed by controller; ready for a future POST /usuarios/:id/link-cliente endpoint.
  async linkCliente(id: number, idCliente: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rolUsuario !== RolUsuario.CLIENTE) {
      throw new BadRequestException('El usuario debe tener rol cliente');
    }

    const cliente = await this.prisma.cliente.findUnique({
      where: { idCliente },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const updated = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { idCliente },
    });
    return this.mapUsuario(updated);
  }

  // Not exposed by controller; ready for a future POST /usuarios/:id/link-empleado endpoint.
  async linkEmpleado(id: number, idEmpleado: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (
      usuario.rolUsuario !== RolUsuario.EMPLEADO_VENTAS &&
      usuario.rolUsuario !== RolUsuario.EMPLEADO_INVENTARIO
    ) {
      throw new BadRequestException(
        'El usuario debe tener rol empleado_ventas o empleado_inventario',
      );
    }

    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const updated = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { idEmpleado },
    });
    return this.mapUsuario(updated);
  }

  // Not exposed by controller; ready for a future POST /usuarios/:id/link-proveedor endpoint.
  async linkProveedor(id: number, idProveedor: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rolUsuario !== RolUsuario.PROVEEDOR) {
      throw new BadRequestException('El usuario debe tener rol proveedor');
    }

    const proveedor = await this.prisma.proveedor.findUnique({
      where: { idProveedor },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    const updated = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { idProveedor },
    });
    return this.mapUsuario(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    const usuario = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: {
        estadoUsuario: 'inactivo',
        fechaInactivacion: new Date(),
      },
    });
    return this.mapUsuario(usuario);
  }

  private mapUsuario(u: UsuarioRow) {
    return {
      id: u.idUsuario,
      correo: u.correoUsuario,
      rol: u.rolUsuario,
      estado: u.estadoUsuario,
      fechaInactivacion: u.fechaInactivacion,
      idCliente: u.idCliente,
      idEmpleado: u.idEmpleado,
      idProveedor: u.idProveedor,
    };
  }

  private mapUsuarioDetalle(u: UsuarioConRelaciones) {
    return {
      ...this.mapUsuario(u),
      cliente: u.cliente
        ? {
            id: u.cliente.idCliente,
            nombre: u.cliente.nombreCliente,
            apellido: u.cliente.apellidoCliente,
            correo: u.cliente.correoCliente,
            estado: u.cliente.estadoCliente,
          }
        : null,
      empleado: u.empleado
        ? {
            id: u.empleado.idEmpleado,
            nombre: u.empleado.nombreEmpleado,
            apellido: u.empleado.apellidoEmpleado,
            estado: u.empleado.estadoEmpleado,
          }
        : null,
      proveedor: u.proveedor
        ? {
            id: u.proveedor.idProveedor,
            nombre: u.proveedor.nombreProveedor,
            estado: u.proveedor.estadoProveedor,
          }
        : null,
    };
  }
}

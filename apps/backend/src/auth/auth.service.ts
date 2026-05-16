import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthPayload = {
  idUsuario: number;
  correoUsuario: string;
  rolUsuario: string;
  estadoUsuario: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
  nombre: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.contrasena, 10);

    try {
      const { usuario, cliente } = await this.prisma.$transaction(async (tx) => {
        const cliente = await tx.cliente.create({
          data: {
            nombreCliente: dto.nombre,
            apellidoCliente: dto.apellido,
            correoCliente: dto.correo,
            fechaRegistroCliente: new Date(),
            estadoCliente: 'activo',
          },
        });

        const usuario = await tx.usuario.create({
          data: {
            correoUsuario: dto.correo,
            contrasenaHash: hash,
            rolUsuario: 'cliente',
            estadoUsuario: 'activo',
            idCliente: cliente.idCliente,
          },
        });

        return { usuario, cliente };
      });

      return this.firmarToken({
        idUsuario: usuario.idUsuario,
        correoUsuario: usuario.correoUsuario,
        rolUsuario: usuario.rolUsuario,
        estadoUsuario: usuario.estadoUsuario,
        idCliente: usuario.idCliente,
        idEmpleado: usuario.idEmpleado,
        idProveedor: usuario.idProveedor,
        nombre: `${cliente.nombreCliente} ${cliente.apellidoCliente}`,
      });
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

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correoUsuario: dto.correo },
      include: {
        cliente: { select: { nombreCliente: true, apellidoCliente: true } },
        empleado: { select: { nombreEmpleado: true, apellidoEmpleado: true } },
        proveedor: { select: { nombreProveedor: true } },
      },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    if (usuario.estadoUsuario !== 'activo') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valido = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    const nombre = usuario.cliente
      ? `${usuario.cliente.nombreCliente} ${usuario.cliente.apellidoCliente}`
      : usuario.empleado
        ? `${usuario.empleado.nombreEmpleado} ${usuario.empleado.apellidoEmpleado}`
        : usuario.proveedor
          ? usuario.proveedor.nombreProveedor
          : null;

    return this.firmarToken({
      idUsuario: usuario.idUsuario,
      correoUsuario: usuario.correoUsuario,
      rolUsuario: usuario.rolUsuario,
      estadoUsuario: usuario.estadoUsuario,
      idCliente: usuario.idCliente,
      idEmpleado: usuario.idEmpleado,
      idProveedor: usuario.idProveedor,
      nombre,
    });
  }

  private firmarToken(u: AuthPayload) {
    const payload = {
      sub: u.idUsuario,
      correo: u.correoUsuario,
      rol: u.rolUsuario,
      idCliente: u.idCliente,
      idEmpleado: u.idEmpleado,
      idProveedor: u.idProveedor,
    };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: u.idUsuario,
        correo: u.correoUsuario,
        rol: u.rolUsuario,
        estado: u.estadoUsuario,
        nombre: u.nombre,
        idCliente: u.idCliente,
        idEmpleado: u.idEmpleado,
        idProveedor: u.idProveedor,
      },
    };
  }
}

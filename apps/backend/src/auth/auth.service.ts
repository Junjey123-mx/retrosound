import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (existe) throw new ConflictException('El correo ya está registrado');

    const hash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          correo: dto.correo,
          fechaRegistro: new Date(),
        },
      });
      return tx.usuario.create({
        data: {
          correo: dto.correo,
          contrasenaHash: hash,
          rol: 'cliente',
          idCliente: cliente.id,
        },
      });
    });

    return this.firmarToken(usuario.id, usuario.correo, usuario.rol);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valido = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    return this.firmarToken(usuario.id, usuario.correo, usuario.rol);
  }

  private firmarToken(id: number, correo: string, rol: string) {
    const token = this.jwt.sign({ sub: id, correo, rol });
    return { access_token: token };
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type UsuarioAuthRow = {
  id_usuario: number;
  correo_usuario: string;
  contrasena_hash: string;
  rol_usuario: string;
  estado_usuario: string;
  id_cliente: number | null;
  id_empleado: number | null;
  id_proveedor: number | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      const existe = await client.query<{ id_usuario: number }>(
        `
        SELECT id_usuario
        FROM usuario
        WHERE correo_usuario = $1
        LIMIT 1
        `,
        [dto.correo],
      );
      if (existe.rowCount && existe.rowCount > 0) {
        throw new ConflictException('El correo ya está registrado');
      }

      const hash = await bcrypt.hash(dto.contrasena, 10);

      const clienteResult = await client.query<{ id_cliente: number }>(
        `
        INSERT INTO cliente
          (nombre_cliente, apellido_cliente, correo_cliente, fecha_registro_cliente, estado_cliente)
        VALUES
          ($1, $2, $3, CURRENT_DATE, 'activo')
        RETURNING id_cliente
        `,
        [dto.nombre, dto.apellido, dto.correo],
      );
      const cliente = clienteResult.rows[0];

      const usuarioResult = await client.query<{
        id_usuario: number;
        correo_usuario: string;
        rol_usuario: string;
      }>(
        `
        INSERT INTO usuario
          (correo_usuario, contrasena_hash, rol_usuario, estado_usuario, id_cliente, id_empleado, id_proveedor)
        VALUES
          ($1, $2, 'cliente', 'activo', $3, NULL, NULL)
        RETURNING id_usuario, correo_usuario, rol_usuario
        `,
        [dto.correo, hash, cliente.id_cliente],
      );
      const usuario = usuarioResult.rows[0];

      await client.query('COMMIT');

      return this.firmarToken(
        usuario.id_usuario,
        usuario.correo_usuario,
        usuario.rol_usuario,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async login(dto: LoginDto) {
    const result = await this.db.query<UsuarioAuthRow>(
      `
      SELECT
        id_usuario,
        correo_usuario,
        contrasena_hash,
        rol_usuario,
        estado_usuario,
        id_cliente,
        id_empleado,
        id_proveedor
      FROM usuario
      WHERE correo_usuario = $1
      LIMIT 1
      `,
      [dto.correo],
    );
    const usuario = result.rows[0];
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    if (usuario.estado_usuario !== 'activo') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valido = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    return this.firmarToken(
      usuario.id_usuario,
      usuario.correo_usuario,
      usuario.rol_usuario,
    );
  }

  private firmarToken(id: number, correo: string, rol: string) {
    const token = this.jwt.sign({ sub: id, correo, rol });
    return { access_token: token };
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}

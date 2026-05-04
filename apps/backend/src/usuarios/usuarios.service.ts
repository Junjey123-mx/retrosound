import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

type UsuarioRow = {
  id: number;
  correo: string;
  rol: string;
  estado: string;
  fechaInactivacion: string | null;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<UsuarioRow>(`
      SELECT
        id_usuario        AS "id",
        correo_usuario    AS "correo",
        rol_usuario       AS "rol",
        estado_usuario    AS "estado",
        fecha_inactivacion AS "fechaInactivacion",
        id_cliente        AS "idCliente",
        id_empleado       AS "idEmpleado",
        id_proveedor      AS "idProveedor"
      FROM usuario
      ORDER BY id_usuario
    `);

    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.db.query<UsuarioRow>(
      `
      SELECT
        id_usuario        AS "id",
        correo_usuario    AS "correo",
        rol_usuario       AS "rol",
        estado_usuario    AS "estado",
        fecha_inactivacion AS "fechaInactivacion",
        id_cliente        AS "idCliente",
        id_empleado       AS "idEmpleado",
        id_proveedor      AS "idProveedor"
      FROM usuario
      WHERE id_usuario = $1
      LIMIT 1
      `,
      [id],
    );

    const usuario = result.rows[0];
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const fields: string[] = [];
    const values: unknown[] = [];
    const addField = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.estado !== undefined) addField('estado_usuario', dto.estado);
    if (dto.rol !== undefined) addField('rol_usuario', dto.rol);

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const result = await this.db.query<UsuarioRow>(
      `
      UPDATE usuario
      SET ${fields.join(', ')}
      WHERE id_usuario = $${values.length}
      RETURNING
        id_usuario        AS "id",
        correo_usuario    AS "correo",
        rol_usuario       AS "rol",
        estado_usuario    AS "estado",
        fecha_inactivacion AS "fechaInactivacion",
        id_cliente        AS "idCliente",
        id_empleado       AS "idEmpleado",
        id_proveedor      AS "idProveedor"
      `,
      values,
    );

    return result.rows[0];
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.db.query<UsuarioRow>(
      `
      UPDATE usuario
      SET estado_usuario    = 'inactivo',
          fecha_inactivacion = CURRENT_DATE
      WHERE id_usuario = $1
      RETURNING
        id_usuario        AS "id",
        correo_usuario    AS "correo",
        rol_usuario       AS "rol",
        estado_usuario    AS "estado",
        fecha_inactivacion AS "fechaInactivacion",
        id_cliente        AS "idCliente",
        id_empleado       AS "idEmpleado",
        id_proveedor      AS "idProveedor"
      `,
      [id],
    );

    return result.rows[0];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';

type EmpleadoRow = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  correo: string | null;
  fechaContratacion: string;
  estado: string;
  fechaInactivacion: string | null;
};

@Injectable()
export class EmpleadosService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<EmpleadoRow>(`
      SELECT
        id_empleado AS "id",
        nombre_empleado AS "nombre",
        apellido_empleado AS "apellido",
        telefono_empleado AS "telefono",
        correo_empleado AS "correo",
        fecha_contratacion AS "fechaContratacion",
        estado_empleado AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM empleado
      WHERE estado_empleado = 'activo'
      ORDER BY id_empleado
    `);

    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.db.query<EmpleadoRow>(
      `
      SELECT
        id_empleado AS "id",
        nombre_empleado AS "nombre",
        apellido_empleado AS "apellido",
        telefono_empleado AS "telefono",
        correo_empleado AS "correo",
        fecha_contratacion AS "fechaContratacion",
        estado_empleado AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM empleado
      WHERE id_empleado = $1
      LIMIT 1
      `,
      [id],
    );

    const empleado = result.rows[0];
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    return empleado;
  }

  async create(dto: CreateEmpleadoDto) {
    const result = await this.db.query<EmpleadoRow>(
      `
      INSERT INTO empleado
        (nombre_empleado, apellido_empleado, telefono_empleado,
         correo_empleado, fecha_contratacion)
      VALUES
        ($1, $2, $3, $4, $5::DATE)
      RETURNING
        id_empleado AS "id",
        nombre_empleado AS "nombre",
        apellido_empleado AS "apellido",
        telefono_empleado AS "telefono",
        correo_empleado AS "correo",
        fecha_contratacion AS "fechaContratacion",
        estado_empleado AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [
        dto.nombre,
        dto.apellido,
        dto.telefono ?? null,
        dto.correo ?? null,
        dto.fechaContratacion,
      ],
    );

    return result.rows[0];
  }

  async update(id: number, dto: Partial<CreateEmpleadoDto>) {
    await this.findOne(id);

    const fields: string[] = [];
    const values: unknown[] = [];
    const addField = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.nombre !== undefined) addField('nombre_empleado', dto.nombre);
    if (dto.apellido !== undefined) addField('apellido_empleado', dto.apellido);
    if (dto.telefono !== undefined) addField('telefono_empleado', dto.telefono);
    if (dto.correo !== undefined) addField('correo_empleado', dto.correo);
    if (dto.fechaContratacion !== undefined) {
      values.push(dto.fechaContratacion);
      fields.push(`fecha_contratacion = $${values.length}::DATE`);
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const result = await this.db.query<EmpleadoRow>(
      `
      UPDATE empleado
      SET ${fields.join(', ')}
      WHERE id_empleado = $${values.length}
      RETURNING
        id_empleado AS "id",
        nombre_empleado AS "nombre",
        apellido_empleado AS "apellido",
        telefono_empleado AS "telefono",
        correo_empleado AS "correo",
        fecha_contratacion AS "fechaContratacion",
        estado_empleado AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      values,
    );

    return result.rows[0];
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.db.query<EmpleadoRow>(
      `
      UPDATE empleado
      SET estado_empleado = 'inactivo',
          fecha_inactivacion = CURRENT_DATE
      WHERE id_empleado = $1
      RETURNING
        id_empleado AS "id",
        nombre_empleado AS "nombre",
        apellido_empleado AS "apellido",
        telefono_empleado AS "telefono",
        correo_empleado AS "correo",
        fecha_contratacion AS "fechaContratacion",
        estado_empleado AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [id],
    );

    return result.rows[0];
  }
}

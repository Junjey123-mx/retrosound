import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
import { CreateClienteDto } from './dto/create-cliente.dto';

type ClienteRow = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  fechaRegistro: string;
  estado: string;
  fechaInactivacion: string | null;
};

@Injectable()
export class ClientesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<ClienteRow>(`
      SELECT
        id_cliente AS "id",
        nombre_cliente AS "nombre",
        apellido_cliente AS "apellido",
        telefono_cliente AS "telefono",
        correo_cliente AS "correo",
        direccion_cliente AS "direccion",
        fecha_registro_cliente AS "fechaRegistro",
        estado_cliente AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM cliente
      WHERE estado_cliente = 'activo'
      ORDER BY id_cliente
    `);

    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.db.query<ClienteRow>(
      `
      SELECT
        id_cliente AS "id",
        nombre_cliente AS "nombre",
        apellido_cliente AS "apellido",
        telefono_cliente AS "telefono",
        correo_cliente AS "correo",
        direccion_cliente AS "direccion",
        fecha_registro_cliente AS "fechaRegistro",
        estado_cliente AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM cliente
      WHERE id_cliente = $1
      LIMIT 1
      `,
      [id],
    );

    const cliente = result.rows[0];
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return cliente;
  }

  async create(dto: CreateClienteDto) {
    const result = await this.db.query<ClienteRow>(
      `
      INSERT INTO cliente
        (nombre_cliente, apellido_cliente, telefono_cliente, correo_cliente,
         direccion_cliente, fecha_registro_cliente)
      VALUES
        ($1, $2, $3, $4, $5, $6::DATE)
      RETURNING
        id_cliente AS "id",
        nombre_cliente AS "nombre",
        apellido_cliente AS "apellido",
        telefono_cliente AS "telefono",
        correo_cliente AS "correo",
        direccion_cliente AS "direccion",
        fecha_registro_cliente AS "fechaRegistro",
        estado_cliente AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [
        dto.nombre,
        dto.apellido,
        dto.telefono ?? null,
        dto.correo ?? null,
        dto.direccion ?? null,
        dto.fechaRegistro,
      ],
    );

    return result.rows[0];
  }

  async update(id: number, dto: Partial<CreateClienteDto>) {
    await this.findOne(id);

    const fields: string[] = [];
    const values: unknown[] = [];
    const addField = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    if (dto.nombre !== undefined) addField('nombre_cliente', dto.nombre);
    if (dto.apellido !== undefined) addField('apellido_cliente', dto.apellido);
    if (dto.telefono !== undefined) addField('telefono_cliente', dto.telefono);
    if (dto.correo !== undefined) addField('correo_cliente', dto.correo);
    if (dto.direccion !== undefined) addField('direccion_cliente', dto.direccion);
    if (dto.fechaRegistro !== undefined) {
      values.push(dto.fechaRegistro);
      fields.push(`fecha_registro_cliente = $${values.length}::DATE`);
    }

    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const result = await this.db.query<ClienteRow>(
      `
      UPDATE cliente
      SET ${fields.join(', ')}
      WHERE id_cliente = $${values.length}
      RETURNING
        id_cliente AS "id",
        nombre_cliente AS "nombre",
        apellido_cliente AS "apellido",
        telefono_cliente AS "telefono",
        correo_cliente AS "correo",
        direccion_cliente AS "direccion",
        fecha_registro_cliente AS "fechaRegistro",
        estado_cliente AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      values,
    );

    return result.rows[0];
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.db.query<ClienteRow>(
      `
      UPDATE cliente
      SET estado_cliente = 'inactivo',
          fecha_inactivacion = CURRENT_DATE
      WHERE id_cliente = $1
      RETURNING
        id_cliente AS "id",
        nombre_cliente AS "nombre",
        apellido_cliente AS "apellido",
        telefono_cliente AS "telefono",
        correo_cliente AS "correo",
        direccion_cliente AS "direccion",
        fecha_registro_cliente AS "fechaRegistro",
        estado_cliente AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [id],
    );

    return result.rows[0];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

type ProveedorRow = {
  id: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  nombreContacto: string | null;
  estado: string;
  fechaInactivacion: string | Date | null;
};

@Injectable()
export class ProveedoresService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<ProveedorRow>(`
      SELECT
        id_proveedor AS "id",
        nombre_proveedor AS "nombre",
        telefono_proveedor AS "telefono",
        correo_proveedor AS "correo",
        direccion_proveedor AS "direccion",
        nombre_contacto_proveedor AS "nombreContacto",
        estado_proveedor AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM proveedor
      ORDER BY nombre_proveedor ASC
    `);

    return result.rows.map((row) => this.mapProveedor(row));
  }

  async findOne(id: number) {
    const proveedor = await this.findProveedorById(id);
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor;
  }

  async create(dto: CreateProveedorDto) {
    const result = await this.db.query<ProveedorRow>(
      `
      INSERT INTO proveedor (
        nombre_proveedor,
        telefono_proveedor,
        correo_proveedor,
        direccion_proveedor,
        nombre_contacto_proveedor
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id_proveedor AS "id",
        nombre_proveedor AS "nombre",
        telefono_proveedor AS "telefono",
        correo_proveedor AS "correo",
        direccion_proveedor AS "direccion",
        nombre_contacto_proveedor AS "nombreContacto",
        estado_proveedor AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [
        dto.nombre,
        dto.telefono ?? null,
        dto.correo ?? null,
        dto.direccion ?? null,
        dto.nombreContacto ?? null,
      ],
    );

    return this.mapProveedor(result.rows[0]);
  }

  async update(id: number, dto: Partial<CreateProveedorDto>) {
    await this.findOne(id);

    const updates: string[] = [];
    const params: unknown[] = [];

    this.addUpdate(updates, params, 'nombre_proveedor', dto.nombre);
    this.addUpdate(updates, params, 'telefono_proveedor', dto.telefono);
    this.addUpdate(updates, params, 'correo_proveedor', dto.correo);
    this.addUpdate(updates, params, 'direccion_proveedor', dto.direccion);
    this.addUpdate(
      updates,
      params,
      'nombre_contacto_proveedor',
      dto.nombreContacto,
    );

    if (updates.length === 0) return this.findOne(id);

    params.push(id);
    const result = await this.db.query<ProveedorRow>(
      `
      UPDATE proveedor
      SET ${updates.join(', ')}
      WHERE id_proveedor = $${params.length}
      RETURNING
        id_proveedor AS "id",
        nombre_proveedor AS "nombre",
        telefono_proveedor AS "telefono",
        correo_proveedor AS "correo",
        direccion_proveedor AS "direccion",
        nombre_contacto_proveedor AS "nombreContacto",
        estado_proveedor AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      params,
    );

    return this.mapProveedor(result.rows[0]);
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.db.query<ProveedorRow>(
      `
      UPDATE proveedor
      SET estado_proveedor = 'inactivo',
          fecha_inactivacion = CURRENT_DATE
      WHERE id_proveedor = $1
      RETURNING
        id_proveedor AS "id",
        nombre_proveedor AS "nombre",
        telefono_proveedor AS "telefono",
        correo_proveedor AS "correo",
        direccion_proveedor AS "direccion",
        nombre_contacto_proveedor AS "nombreContacto",
        estado_proveedor AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      `,
      [id],
    );

    return this.mapProveedor(result.rows[0]);
  }

  private async findProveedorById(id: number) {
    const result = await this.db.query<ProveedorRow>(
      `
      SELECT
        id_proveedor AS "id",
        nombre_proveedor AS "nombre",
        telefono_proveedor AS "telefono",
        correo_proveedor AS "correo",
        direccion_proveedor AS "direccion",
        nombre_contacto_proveedor AS "nombreContacto",
        estado_proveedor AS "estado",
        fecha_inactivacion AS "fechaInactivacion"
      FROM proveedor
      WHERE id_proveedor = $1
      `,
      [id],
    );

    const row = result.rows[0];
    return row ? this.mapProveedor(row) : null;
  }

  private addUpdate(
    updates: string[],
    params: unknown[],
    column: string,
    value: unknown,
  ) {
    if (value === undefined) return;

    params.push(value);
    updates.push(`${column} = $${params.length}`);
  }

  private mapProveedor(row: ProveedorRow) {
    return {
      id: row.id,
      nombre: row.nombre,
      telefono: row.telefono,
      correo: row.correo,
      direccion: row.direccion,
      nombreContacto: row.nombreContacto,
      estado: row.estado,
      fechaInactivacion: row.fechaInactivacion,
    };
  }
}

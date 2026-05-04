import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database';

@Injectable()
export class CatalogsService {
  constructor(private readonly db: DatabaseService) {}

  async getCategorias() {
    const result = await this.db.query(`
      SELECT
        id_categoria AS "id",
        nombre_categoria AS "nombre",
        descripcion_categoria AS "descripcion",
        estado_categoria AS "estado"
      FROM categoria
      WHERE estado_categoria = 'activo'
      ORDER BY id_categoria
    `);

    return result.rows;
  }

  async getFormatos() {
    const result = await this.db.query(`
      SELECT
        id_formato AS "id",
        nombre_formato AS "nombre",
        descripcion_formato AS "descripcion",
        estado_formato AS "estado"
      FROM formato
      WHERE estado_formato = 'activo'
      ORDER BY id_formato
    `);

    return result.rows;
  }

  async getGeneros() {
    const result = await this.db.query(`
      SELECT
        id_genero_musical AS "id",
        nombre_genero_musical AS "nombre",
        descripcion_genero_musical AS "descripcion",
        estado_genero_musical AS "estado"
      FROM genero_musical
      WHERE estado_genero_musical = 'activo'
      ORDER BY id_genero_musical
    `);

    return result.rows;
  }

  async getArtistas() {
    const result = await this.db.query(`
      SELECT
        id_artista AS "id",
        nombre_artista AS "nombre",
        pais_origen_artista AS "paisOrigen",
        anio_inicio_artista AS "anioInicio",
        estado_artista AS "estado"
      FROM artista
      WHERE estado_artista = 'activo'
      ORDER BY id_artista
    `);

    return result.rows;
  }

  async createCategoria(nombre: string, descripcion?: string) {
    const result = await this.db.query(
      `
      INSERT INTO categoria (nombre_categoria, descripcion_categoria)
      VALUES ($1, $2)
      RETURNING
        id_categoria AS "id",
        nombre_categoria AS "nombre",
        descripcion_categoria AS "descripcion",
        estado_categoria AS "estado"
      `,
      [nombre, descripcion ?? null],
    );

    return result.rows[0];
  }

  async createFormato(nombre: string, descripcion?: string) {
    const result = await this.db.query(
      `
      INSERT INTO formato (nombre_formato, descripcion_formato)
      VALUES ($1, $2)
      RETURNING
        id_formato AS "id",
        nombre_formato AS "nombre",
        descripcion_formato AS "descripcion",
        estado_formato AS "estado"
      `,
      [nombre, descripcion ?? null],
    );

    return result.rows[0];
  }

  async createGenero(nombre: string, descripcion?: string) {
    const result = await this.db.query(
      `
      INSERT INTO genero_musical (nombre_genero_musical, descripcion_genero_musical)
      VALUES ($1, $2)
      RETURNING
        id_genero_musical AS "id",
        nombre_genero_musical AS "nombre",
        descripcion_genero_musical AS "descripcion",
        estado_genero_musical AS "estado"
      `,
      [nombre, descripcion ?? null],
    );

    return result.rows[0];
  }

  async createArtista(data: { nombre: string; paisOrigen?: string; anioInicio?: number }) {
    const result = await this.db.query(
      `
      INSERT INTO artista (nombre_artista, pais_origen_artista, anio_inicio_artista)
      VALUES ($1, $2, $3)
      RETURNING
        id_artista AS "id",
        nombre_artista AS "nombre",
        pais_origen_artista AS "paisOrigen",
        anio_inicio_artista AS "anioInicio",
        estado_artista AS "estado"
      `,
      [data.nombre, data.paisOrigen ?? null, data.anioInicio ?? null],
    );

    return result.rows[0];
  }
}

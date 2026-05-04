import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type PoolClient } from 'pg';
import { DatabaseService } from '../database';
import { CreateProductoDto } from './dto/create-producto.dto';

type ProductoRow = {
  id: number;
  titulo: string;
  descripcion: string | null;
  anioLanzamiento: number | null;
  precioVenta: string | number;
  stockActual: number;
  stockMinimo: number;
  codigoSku: string;
  estado: string;
  fechaInactivacion: string | Date | null;
  idCategoria: number;
  idFormato: number;
  categoria: unknown;
  formato: unknown;
  artistas: unknown;
  generos: unknown;
};

type ProductoPlainRow = Omit<
  ProductoRow,
  'categoria' | 'formato' | 'artistas' | 'generos'
>;

@Injectable()
export class ProductosService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query<ProductoRow>(this.productoSelectSql(`
      WHERE p.estado_producto != 'descontinuado'
      ORDER BY p.id_producto
    `));

    return result.rows.map((row) => this.mapProducto(row));
  }

  async findOne(id: number) {
    const producto = await this.findProductoById(id);
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async create(dto: CreateProductoDto) {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');
      await this.validateCatalogReferences(client, dto);
      await this.validateRelationReferences(client, dto.artistaIds, dto.generoIds);

      const result = await client.query<ProductoPlainRow>(
        `
        INSERT INTO producto (
          titulo_producto,
          descripcion_producto,
          anio_lanzamiento,
          precio_venta,
          stock_actual,
          stock_minimo,
          codigo_sku,
          id_categoria,
          id_formato
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id_producto AS "id",
          titulo_producto AS "titulo",
          descripcion_producto AS "descripcion",
          anio_lanzamiento AS "anioLanzamiento",
          precio_venta AS "precioVenta",
          stock_actual AS "stockActual",
          stock_minimo AS "stockMinimo",
          codigo_sku AS "codigoSku",
          estado_producto AS "estado",
          fecha_inactivacion AS "fechaInactivacion",
          id_categoria AS "idCategoria",
          id_formato AS "idFormato"
        `,
        [
          dto.titulo,
          dto.descripcion ?? null,
          dto.anioLanzamiento ?? null,
          dto.precioVenta,
          dto.stockActual,
          dto.stockMinimo,
          dto.codigoSku,
          dto.idCategoria,
          dto.idFormato,
        ],
      );

      const producto = this.mapPlainProducto(result.rows[0]);
      await this.replaceProductoArtistas(client, producto.id, dto.artistaIds);
      await this.replaceProductoGeneros(client, producto.id, dto.generoIds);
      await client.query('COMMIT');

      return producto;
    } catch (error) {
      await client.query('ROLLBACK');
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async update(id: number, dto: Partial<CreateProductoDto>) {
    await this.findOne(id);

    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');
      await this.validateCatalogReferences(client, dto);
      await this.validateRelationReferences(client, dto.artistaIds, dto.generoIds);

      const updates: string[] = [];
      const params: unknown[] = [];

      this.addUpdate(updates, params, 'titulo_producto', dto.titulo);
      this.addUpdate(updates, params, 'descripcion_producto', dto.descripcion);
      this.addUpdate(updates, params, 'anio_lanzamiento', dto.anioLanzamiento);
      this.addUpdate(updates, params, 'precio_venta', dto.precioVenta);
      this.addUpdate(updates, params, 'stock_actual', dto.stockActual);
      this.addUpdate(updates, params, 'stock_minimo', dto.stockMinimo);
      this.addUpdate(updates, params, 'codigo_sku', dto.codigoSku);
      this.addUpdate(updates, params, 'id_categoria', dto.idCategoria);
      this.addUpdate(updates, params, 'id_formato', dto.idFormato);

      let producto: ReturnType<typeof this.mapPlainProducto> | null = null;

      if (updates.length > 0) {
        params.push(id);
        const result = await client.query<ProductoPlainRow>(
          `
          UPDATE producto
          SET ${updates.join(', ')}
          WHERE id_producto = $${params.length}
          RETURNING
            id_producto AS "id",
            titulo_producto AS "titulo",
            descripcion_producto AS "descripcion",
            anio_lanzamiento AS "anioLanzamiento",
            precio_venta AS "precioVenta",
            stock_actual AS "stockActual",
            stock_minimo AS "stockMinimo",
            codigo_sku AS "codigoSku",
            estado_producto AS "estado",
            fecha_inactivacion AS "fechaInactivacion",
            id_categoria AS "idCategoria",
            id_formato AS "idFormato"
          `,
          params,
        );
        producto = this.mapPlainProducto(result.rows[0]);
      }

      if (dto.artistaIds !== undefined) {
        await this.replaceProductoArtistas(client, id, dto.artistaIds);
      }

      if (dto.generoIds !== undefined) {
        await this.replaceProductoGeneros(client, id, dto.generoIds);
      }

      await client.query('COMMIT');

      return producto ?? (await this.findOne(id));
    } catch (error) {
      await client.query('ROLLBACK');
      this.handleDbError(error);
    } finally {
      client.release();
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const result = await this.db.query<ProductoPlainRow>(
      `
      UPDATE producto
      SET estado_producto = 'descontinuado',
          fecha_inactivacion = CURRENT_DATE
      WHERE id_producto = $1
      RETURNING
        id_producto AS "id",
        titulo_producto AS "titulo",
        descripcion_producto AS "descripcion",
        anio_lanzamiento AS "anioLanzamiento",
        precio_venta AS "precioVenta",
        stock_actual AS "stockActual",
        stock_minimo AS "stockMinimo",
        codigo_sku AS "codigoSku",
        estado_producto AS "estado",
        fecha_inactivacion AS "fechaInactivacion",
        id_categoria AS "idCategoria",
        id_formato AS "idFormato"
      `,
      [id],
    );

    return this.mapPlainProducto(result.rows[0]);
  }

  private async findProductoById(id: number) {
    const result = await this.db.query<ProductoRow>(
      this.productoSelectSql('WHERE p.id_producto = $1'),
      [id],
    );

    const row = result.rows[0];
    return row ? this.mapProducto(row) : null;
  }

  private productoSelectSql(whereAndOrder: string): string {
    return `
      SELECT
        p.id_producto AS "id",
        p.titulo_producto AS "titulo",
        p.descripcion_producto AS "descripcion",
        p.anio_lanzamiento AS "anioLanzamiento",
        p.precio_venta AS "precioVenta",
        p.stock_actual AS "stockActual",
        p.stock_minimo AS "stockMinimo",
        p.codigo_sku AS "codigoSku",
        p.estado_producto AS "estado",
        p.fecha_inactivacion AS "fechaInactivacion",
        p.id_categoria AS "idCategoria",
        p.id_formato AS "idFormato",
        jsonb_build_object(
          'id', c.id_categoria,
          'nombre', c.nombre_categoria,
          'descripcion', c.descripcion_categoria,
          'estado', c.estado_categoria
        ) AS "categoria",
        jsonb_build_object(
          'id', f.id_formato,
          'nombre', f.nombre_formato,
          'descripcion', f.descripcion_formato,
          'estado', f.estado_formato
        ) AS "formato",
        COALESCE(artistas.items, '[]'::jsonb) AS "artistas",
        COALESCE(generos.items, '[]'::jsonb) AS "generos"
      FROM producto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      JOIN formato f ON f.id_formato = p.id_formato
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'artista',
            jsonb_build_object(
              'id', a.id_artista,
              'nombre', a.nombre_artista,
              'paisOrigen', a.pais_origen_artista,
              'anioInicio', a.anio_inicio_artista,
              'estado', a.estado_artista
            )
          )
          ORDER BY a.nombre_artista
        ) AS items
        FROM producto_artista pa
        JOIN artista a ON a.id_artista = pa.id_artista
        WHERE pa.id_producto = p.id_producto
      ) artistas ON true
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          jsonb_build_object(
            'generoMusical',
            jsonb_build_object(
              'id', gm.id_genero_musical,
              'nombre', gm.nombre_genero_musical,
              'descripcion', gm.descripcion_genero_musical,
              'estado', gm.estado_genero_musical
            )
          )
          ORDER BY gm.nombre_genero_musical
        ) AS items
        FROM producto_genero pg
        JOIN genero_musical gm ON gm.id_genero_musical = pg.id_genero_musical
        WHERE pg.id_producto = p.id_producto
      ) generos ON true
      ${whereAndOrder}
    `;
  }

  private mapProducto(row: ProductoRow) {
    return {
      ...this.mapPlainProducto(row),
      categoria: row.categoria,
      formato: row.formato,
      artistas: row.artistas,
      generos: row.generos,
    };
  }

  private mapPlainProducto(row: ProductoPlainRow) {
    return {
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      anioLanzamiento: row.anioLanzamiento,
      precioVenta: Number(row.precioVenta),
      stockActual: row.stockActual,
      stockMinimo: row.stockMinimo,
      codigoSku: row.codigoSku,
      estado: row.estado,
      fechaInactivacion: row.fechaInactivacion,
      idCategoria: row.idCategoria,
      idFormato: row.idFormato,
    };
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

  private async validateCatalogReferences(
    client: PoolClient,
    dto: Partial<CreateProductoDto>,
  ) {
    if (dto.idCategoria !== undefined) {
      await this.ensureExists(
        client,
        'categoria',
        'id_categoria',
        dto.idCategoria,
        'Categoría no encontrada',
      );
    }

    if (dto.idFormato !== undefined) {
      await this.ensureExists(
        client,
        'formato',
        'id_formato',
        dto.idFormato,
        'Formato no encontrado',
      );
    }
  }

  private async validateRelationReferences(
    client: PoolClient,
    artistaIds?: number[],
    generoIds?: number[],
  ) {
    if (artistaIds !== undefined) {
      await this.ensureAllExist(
        client,
        'artista',
        'id_artista',
        artistaIds,
        'Artista no encontrado',
      );
    }

    if (generoIds !== undefined) {
      await this.ensureAllExist(
        client,
        'genero_musical',
        'id_genero_musical',
        generoIds,
        'Género musical no encontrado',
      );
    }
  }

  private async ensureExists(
    client: PoolClient,
    table: string,
    column: string,
    id: number,
    message: string,
  ) {
    const result = await client.query(
      `SELECT 1 FROM ${table} WHERE ${column} = $1`,
      [id],
    );

    if (result.rowCount === 0) throw new BadRequestException(message);
  }

  private async ensureAllExist(
    client: PoolClient,
    table: string,
    column: string,
    ids: number[],
    message: string,
  ) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return;

    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM ${table} WHERE ${column} = ANY($1::int[])`,
      [uniqueIds],
    );

    if (Number(result.rows[0].count) !== uniqueIds.length) {
      throw new BadRequestException(message);
    }
  }

  private async replaceProductoArtistas(
    client: PoolClient,
    productoId: number,
    artistaIds?: number[],
  ) {
    if (artistaIds === undefined) return;

    await client.query('DELETE FROM producto_artista WHERE id_producto = $1', [
      productoId,
    ]);

    const uniqueIds = [...new Set(artistaIds)];
    if (uniqueIds.length === 0) return;

    await client.query(
      `
      INSERT INTO producto_artista (id_producto, id_artista)
      SELECT $1, UNNEST($2::int[])
      `,
      [productoId, uniqueIds],
    );
  }

  private async replaceProductoGeneros(
    client: PoolClient,
    productoId: number,
    generoIds?: number[],
  ) {
    if (generoIds === undefined) return;

    await client.query('DELETE FROM producto_genero WHERE id_producto = $1', [
      productoId,
    ]);

    const uniqueIds = [...new Set(generoIds)];
    if (uniqueIds.length === 0) return;

    await client.query(
      `
      INSERT INTO producto_genero (id_producto, id_genero_musical)
      SELECT $1, UNNEST($2::int[])
      `,
      [productoId, uniqueIds],
    );
  }

  private handleDbError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new BadRequestException('El SKU ya existe');
    }

    throw error;
  }
}

import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  anioLanzamiento?: number;

  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsInt()
  @Min(0)
  stockActual: number;

  @IsInt()
  @Min(0)
  stockMinimo: number;

  @IsString()
  codigoSku: string;

  @IsInt()
  idCategoria: number;

  @IsInt()
  idFormato: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  artistaIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  generoIds?: number[];
}

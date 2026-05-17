import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindProveedorProductosDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['activo', 'agotado', 'inactivo', 'descontinuado'])
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

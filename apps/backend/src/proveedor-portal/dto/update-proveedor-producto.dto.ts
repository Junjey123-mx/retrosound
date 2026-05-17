import { IsOptional, IsString } from 'class-validator';

export class UpdateProveedorProductoDto {
  @IsOptional()
  @IsString()
  descripcion?: string;
}

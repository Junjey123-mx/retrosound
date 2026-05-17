import { IsOptional, IsString } from 'class-validator';

export class UpdateProveedorPerfilDto {
  @IsOptional()
  @IsString()
  nombreProveedor?: string;

  @IsOptional()
  @IsString()
  telefonoProveedor?: string;

  @IsOptional()
  @IsString()
  correoProveedor?: string;

  @IsOptional()
  @IsString()
  direccionProveedor?: string;

  @IsOptional()
  @IsString()
  nombreContacto?: string;
}

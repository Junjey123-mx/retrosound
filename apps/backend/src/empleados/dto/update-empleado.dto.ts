import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsDateString()
  fechaContratacion?: string;
}

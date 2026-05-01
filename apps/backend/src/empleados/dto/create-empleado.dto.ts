import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsDateString()
  fechaContratacion: string;
}

import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../enums/usuario.enums';

export class CreateUsuarioDto {
  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(8)
  contrasena: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}

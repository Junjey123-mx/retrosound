import { IsEnum, IsOptional } from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;
}

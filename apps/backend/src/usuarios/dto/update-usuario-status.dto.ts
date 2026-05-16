import { IsEnum } from 'class-validator';
import { EstadoUsuario } from '../enums/usuario.enums';

export class UpdateUsuarioStatusDto {
  @IsEnum(EstadoUsuario)
  estado: EstadoUsuario;
}

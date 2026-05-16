import { IsIn } from 'class-validator';

export class UpdateClienteStatusDto {
  @IsIn(['activo', 'inactivo'])
  estado: string;
}

import { IsIn } from 'class-validator';

export class UpdateEmpleadoStatusDto {
  @IsIn(['activo', 'inactivo'])
  estado: string;
}

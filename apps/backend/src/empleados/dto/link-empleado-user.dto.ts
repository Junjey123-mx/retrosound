import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkEmpleadoUserDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idUsuario: number;
}

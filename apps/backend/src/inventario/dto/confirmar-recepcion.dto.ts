import { IsInt, Min } from 'class-validator';

export class ConfirmarRecepcionDto {
  @IsInt()
  @Min(0)
  cantidadRecibida: number;
}

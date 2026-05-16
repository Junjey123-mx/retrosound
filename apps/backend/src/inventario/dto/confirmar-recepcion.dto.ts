import { IsInt, Min } from 'class-validator';

export class ConfirmarRecepcionDto {
  @IsInt()
  @Min(1)
  cantidadRecibida: number;
}

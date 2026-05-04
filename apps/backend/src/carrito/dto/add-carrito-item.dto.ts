import { IsInt, Min } from 'class-validator';

export class AddCarritoItemDto {
  @IsInt()
  idProducto: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

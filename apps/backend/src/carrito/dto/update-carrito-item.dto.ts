import { IsInt, Min } from 'class-validator';

export class UpdateCarritoItemDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}

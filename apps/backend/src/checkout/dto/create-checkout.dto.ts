import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  metodoPago: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;
}

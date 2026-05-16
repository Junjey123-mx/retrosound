import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductoImagenDto {
  @IsString()
  @IsNotEmpty()
  imagenUrl: string;

  @IsString()
  @IsNotEmpty()
  imagenPublicId: string;
}

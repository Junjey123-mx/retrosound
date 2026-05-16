import { IsInt, IsNumber, Min } from 'class-validator';

export class RegistrarEntregaProveedorDto {
  @IsInt()
  @Min(1)
  idProducto: number;

  @IsInt()
  @Min(1)
  cantidadReportada: number;

  @IsNumber()
  @Min(0)
  costoUnitario: number;
}

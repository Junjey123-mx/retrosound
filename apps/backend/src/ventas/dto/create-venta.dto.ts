import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  idProducto: number;

  @IsInt()
  @Min(1)
  cantidadVendida: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoDetalle?: number;
}

export class CreateVentaDto {
  @IsDateString()
  fechaVenta: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsString()
  metodoPago: string;

  @IsInt()
  idCliente: number;

  @IsInt()
  idEmpleado: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles: CreateDetalleVentaDto[];
}

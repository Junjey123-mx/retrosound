import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  @Min(1)
  idProducto: number;

  @IsInt()
  @Min(1)
  cantidadVendida: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoDetalle?: number;
}

export class CreateVentaDto {
  @IsInt()
  @Min(1)
  idCliente: number;

  @IsString()
  metodoPago: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles: CreateDetalleVentaDto[];
}

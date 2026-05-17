import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExportReporteDto {
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

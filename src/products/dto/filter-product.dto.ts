import { IsOptional, IsString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  subcategoria?: string;

  @IsOptional()
  @IsString()
  talla?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Precio mínimo debe ser un número' })
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Precio máximo debe ser un número' })
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
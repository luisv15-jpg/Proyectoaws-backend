import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max, IsArray, IsBoolean, IsUrl, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder los 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(2000, { message: 'La descripción no puede exceder los 2000 caracteres' })
  descripcion?: string;

  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString({ message: 'La categoría debe ser texto' })
  categoria!: string;

  @IsOptional()
  @IsString({ message: 'La subcategoría debe ser texto' })
  subcategoria?: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio!: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio de oferta debe ser un número' })
  @Min(0, { message: 'El precio de oferta no puede ser negativo' })
  precio_oferta?: number;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen debe ser válida' })
  imagen_principal?: string;

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @IsUrl({}, { each: true, message: 'Cada URL de imagen debe ser válida' })
  imagenes?: string[];

  @IsOptional()
  @IsArray({ message: 'Las tallas deben ser un array' })
  @IsString({ each: true, message: 'Cada talla debe ser texto' })
  tallas?: string[];

  @IsOptional()
  @IsArray({ message: 'Los colores deben ser un array' })
  @IsString({ each: true, message: 'Cada color debe ser texto' })
  colores?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @IsOptional()
  @IsBoolean({ message: 'Activo debe ser verdadero o falso' })
  activo?: boolean;
}
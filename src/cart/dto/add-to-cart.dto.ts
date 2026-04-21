import { IsNotEmpty, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  productId!: string;

  @IsNotEmpty({ message: 'La talla es requerida' })
  @IsString({ message: 'La talla debe ser texto' })
  talla!: string;

  @IsNotEmpty({ message: 'El color es requerido' })
  @IsString({ message: 'El color debe ser texto' })
  color!: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(100, { message: 'La cantidad máxima es 100' })
  cantidad!: number;
}
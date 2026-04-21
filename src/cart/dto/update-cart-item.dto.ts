import { IsNotEmpty, IsInt, Min, Max, IsUUID } from 'class-validator';

export class UpdateCartItemDto {
  @IsNotEmpty({ message: 'El ID del item es requerido' })
  @IsUUID(4, { message: 'El ID del item debe ser un UUID válido' })
  cartItemId!: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(100, { message: 'La cantidad máxima es 100' })
  cantidad!: number;
}
import { IsNotEmpty, IsString, IsEnum, IsArray, ValidateNested, MinLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
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
  cantidad!: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(['tarjeta', 'yape', 'plin', 'transferencia'], { 
    message: 'El método de pago debe ser: tarjeta, yape, plin o transferencia' 
  })
  metodo_pago!: string;

  @IsNotEmpty({ message: 'La dirección de entrega es requerida' })
  @IsString({ message: 'La dirección debe ser texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion_entrega!: string;
}
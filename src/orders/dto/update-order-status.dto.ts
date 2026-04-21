import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'El estado debe ser: pending, processing, shipped, delivered o cancelled'
  })
  estado!: string;
}
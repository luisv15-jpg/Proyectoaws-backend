import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateBodyMeasurementsDto {
  @IsOptional()
  @IsInt({ message: 'La altura debe ser un número entero' })
  @Min(50, { message: 'La altura mínima es 50 cm' })
  @Max(250, { message: 'La altura máxima es 250 cm' })
  altura_cm?: number;

  @IsOptional()
  @IsInt({ message: 'El peso debe ser un número entero' })
  @Min(10, { message: 'El peso mínimo es 10 kg' })
  @Max(300, { message: 'El peso máximo es 300 kg' })
  peso_kg?: number;
}
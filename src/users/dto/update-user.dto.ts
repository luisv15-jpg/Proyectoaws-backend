import { IsOptional, IsString, IsEmail, MaxLength, MinLength, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(255, { message: 'El email no puede exceder los 255 caracteres' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser texto' })
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @Length(9, 15, { message: 'El teléfono debe tener entre 9 y 15 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El teléfono solo debe contener números' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser texto' })
  @MaxLength(255, { message: 'La URL del avatar no puede exceder los 255 caracteres' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder los 255 caracteres' })
  direccion?: string;
}
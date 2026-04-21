import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Length, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre!: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(255, { message: 'El email no puede exceder los 255 caracteres' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder los 50 caracteres' })
  password!: string;

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
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder los 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'El rol debe ser user o admin' })
  role?: 'user' | 'admin';
}
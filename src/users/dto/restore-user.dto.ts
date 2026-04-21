import { IsNotEmpty, IsUUID } from 'class-validator';

export class RestoreUserDto {
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsUUID(4, { message: 'El ID debe ser un UUID válido' })
  id!: string;
}
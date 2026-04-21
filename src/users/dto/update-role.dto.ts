import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(['user', 'admin'], { message: 'El rol debe ser user o admin' })
  role!: 'user' | 'admin';
}
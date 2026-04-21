import { IsNotEmpty, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsJWT({ message: 'El refresh token debe ser un JWT válido' })
  refresh_token!: string;
}
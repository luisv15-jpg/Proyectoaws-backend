import { Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { SetupService } from './setup.service';

/**
 * Crea las tablas y el usuario administrador inicial.
 *
 * Solo funciona si SETUP_KEY está definida y la petición envía el mismo valor
 * en el header `x-setup-key`. Sin SETUP_KEY el endpoint queda deshabilitado.
 */
@Controller('setup')
export class SetupController {
  constructor(
    private setupService: SetupService,
    private configService: ConfigService,
  ) {}

  @Post('create-tables')
  async createTables(@Headers('x-setup-key') setupKey?: string) {
    const expected = this.configService.get<string>('SETUP_KEY');
    if (!expected || !setupKey || !this.sameValue(setupKey, expected)) {
      throw new ForbiddenException('Setup deshabilitado o clave incorrecta');
    }

    const adminEmail =
      this.configService.getOrThrow<string>('SETUP_ADMIN_EMAIL');
    const adminPassword = this.configService.getOrThrow<string>(
      'SETUP_ADMIN_PASSWORD',
    );
    return this.setupService.createTables(adminEmail, adminPassword);
  }

  private sameValue(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}

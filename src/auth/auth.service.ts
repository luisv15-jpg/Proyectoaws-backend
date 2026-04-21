import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { MailService } from '../mail/mail.service';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService extends BaseDrizzleService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService, 
    drizzleService: DrizzleService,
  ) {
    super(drizzleService);
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, registerDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.db
      .insert(schema.users)
      .values({
        nombre: registerDto.nombre,
        email: registerDto.email,
        password: hashedPassword,
        role: 'user',
        dni: registerDto.dni,
        telefono: registerDto.telefono,
        direccion: registerDto.direccion,
      })
      .returning();

    const { password, ...userWithoutPassword } = newUser[0];
    return { message: 'Usuario registrado exitosamente', user: userWithoutPassword };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, loginDto.email))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user[0].password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user[0].id, email: user[0].email, role: user[0].role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user[0].id }, { expiresIn: '7d' });

    await this.db.insert(schema.sessions).values({
      userId: user[0].id,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user[0].id,
        nombre: user[0].nombre,
        email: user[0].email,
        role: user[0].role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const session = await this.db
        .select()
        .from(schema.sessions)
        .where(
          and(
            eq(schema.sessions.refreshToken, refreshToken),
            eq(schema.sessions.userId, payload.sub),
          ),
        )
        .limit(1);

      if (session.length === 0 || session[0].expiresAt < new Date()) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      const user = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.sub))
        .limit(1);

      if (user.length === 0) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user[0].id, email: user[0].email, role: user[0].role },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (user.length === 0) {
      return { message: 'Si el email existe, recibirás un enlace para recuperar tu contraseña' };
    }

    const token = this.jwtService.sign(
      { sub: user[0].id, type: 'reset' },
      { expiresIn: '1h' },
    );

    await this.db.insert(schema.passwordResetTokens).values({
      userId: user[0].id,
      token: token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    await this.mailService.sendPasswordResetEmail(
      user[0].email,
      token,
      user[0].nombre,
    );

    return { message: 'Si el email existe, recibirás un enlace para recuperar tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.token, token),
          eq(schema.passwordResetTokens.used, false),
        ),
      )
      .limit(1);

    if (resetToken.length === 0 || resetToken[0].expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, resetToken[0].userId));

    await this.db
      .update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.id, resetToken[0].id));

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, userId));

    await this.mailService.sendPasswordChangedEmail(user[0].email, user[0].nombre);
    
    return { message: 'Contraseña cambiada exitosamente' };
  }

  async logout(refreshToken: string) {
    await this.db
      .delete(schema.sessions)
      .where(eq(schema.sessions.refreshToken, refreshToken));
    return { message: 'Sesión cerrada exitosamente' };
  }

  async validateUser(userId: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        nombre: schema.users.nombre,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (user.length === 0) return null;
    return user[0];
  }
}
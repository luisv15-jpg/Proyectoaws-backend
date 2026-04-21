import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq, isNull, sql } from 'drizzle-orm';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';
import { UpdateUserDto, UpdateBodyMeasurementsDto, CreateUserDto } from './dto';

@Injectable()
export class UsersService extends BaseDrizzleService {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async findAll() {
    const users = await this.db
      .select({
        id: schema.users.id,
        nombre: schema.users.nombre,
        email: schema.users.email,
        role: schema.users.role,
        dni: schema.users.dni,
        telefono: schema.users.telefono,
        direccion: schema.users.direccion,
        altura_cm: schema.users.altura_cm,
        peso_kg: schema.users.peso_kg,
        deletedAt: schema.users.deletedAt,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt));

    return users;
  }

  async findAllWithDeleted() {
    const users = await this.db
      .select({
        id: schema.users.id,
        nombre: schema.users.nombre,
        email: schema.users.email,
        role: schema.users.role,
        dni: schema.users.dni,
        telefono: schema.users.telefono,
        direccion: schema.users.direccion,
        altura_cm: schema.users.altura_cm,
        peso_kg: schema.users.peso_kg,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        deletedAt: schema.users.deletedAt,
      })
      .from(schema.users);

    return users;
  }

  async findDeleted() {
    const users = await this.db
      .select({
        id: schema.users.id,
        nombre: schema.users.nombre,
        email: schema.users.email,
        role: schema.users.role,
        dni: schema.users.dni,
        telefono: schema.users.telefono,
        direccion: schema.users.direccion,
        deletedAt: schema.users.deletedAt,
      })
      .from(schema.users)
      .where(sql`${schema.users.deletedAt} IS NOT NULL`);

    return users;
  }

  async findOne(id: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        nombre: schema.users.nombre,
        email: schema.users.email,
        role: schema.users.role,
        dni: schema.users.dni,
        telefono: schema.users.telefono,
        direccion: schema.users.direccion,
        altura_cm: schema.users.altura_cm,
        peso_kg: schema.users.peso_kg,
        deletedAt: schema.users.deletedAt,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user[0];
  }

  async findByEmail(email: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  }

  async create(createUserDto: CreateUserDto) {

    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.db
      .insert(schema.users)
      .values({
        nombre: createUserDto.nombre,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role || 'user',
        dni: createUserDto.dni,
        telefono: createUserDto.telefono,
        direccion: createUserDto.direccion,
      })
      .returning();

    const { password, ...userWithoutPassword } = newUser[0];
    return { message: 'Usuario creado exitosamente', user: userWithoutPassword };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    await this.findOne(id);

    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El email ya está registrado por otro usuario');
      }
    }

    const updatedUser = await this.db
      .update(schema.users)
      .set({
        ...updateUserDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser[0];
    return { message: 'Usuario actualizado exitosamente', user: userWithoutPassword };
  }

  async updateRole(id: string, role: 'user' | 'admin') {

    await this.findOne(id);

    const updatedUser = await this.db
      .update(schema.users)
      .set({
        role: role,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser[0];
    return { message: `Rol actualizado a ${role} exitosamente`, user: userWithoutPassword };
  }

  async updateBodyMeasurements(id: string, dto: UpdateBodyMeasurementsDto) {
    const updatedUser = await this.db
      .update(schema.users)
      .set({
        altura_cm: dto.altura_cm,
        peso_kg: dto.peso_kg,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      message: 'Medidas corporales actualizadas exitosamente',
      user: {
        id: updatedUser[0].id,
        altura_cm: updatedUser[0].altura_cm,
        peso_kg: updatedUser[0].peso_kg,
      },
    };
  }

  async softDelete(id: string) {
    const user = await this.findOne(id);

    if (user.deletedAt) {
      throw new BadRequestException('El usuario ya está en la papelera');
    }

    const deletedUser = await this.db
      .update(schema.users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    const { password, ...userWithoutPassword } = deletedUser[0];
    return { 
      message: 'Usuario movido a la papelera exitosamente', 
      user: userWithoutPassword 
    };
  }

  async restore(id: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user[0].deletedAt) {
      throw new BadRequestException('El usuario no está en la papelera');
    }

    const restoredUser = await this.db
      .update(schema.users)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    const { password, ...userWithoutPassword } = restoredUser[0];
    return { 
      message: 'Usuario restaurado exitosamente', 
      user: userWithoutPassword 
    };
  }
}
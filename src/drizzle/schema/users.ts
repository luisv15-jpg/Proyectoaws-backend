import { pgTable, varchar, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').default('user').notNull(),
    dni: varchar('dni', { length: 8 }),
    avatar: varchar('avatar', { length: 255 }),
    telefono: varchar('telefono', { length: 15 }),
    direccion: varchar('direccion', { length: 255 }),
    altura_cm: integer('altura_cm'),  
    peso_kg: integer('peso_kg'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
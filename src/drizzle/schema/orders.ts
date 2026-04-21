import { pgTable, uuid, decimal, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { orderStatusEnum, paymentMethodEnum } from './enums';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  estado: orderStatusEnum('estado').default('pending').notNull(),
  metodo_pago: paymentMethodEnum('metodo_pago').notNull(),
  direccion_entrega: varchar('direccion_entrega', { length: 255 }).notNull(),
  tracking_number: varchar('tracking_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
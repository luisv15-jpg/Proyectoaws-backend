import { pgTable, uuid, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  talla: varchar('talla', { length: 5 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  cantidad: integer('cantidad').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
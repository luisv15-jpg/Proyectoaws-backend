import { pgTable, uuid, integer, decimal, varchar } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { products } from './products';

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 200 }).notNull(),
  productImage: varchar('product_image', { length: 500 }),
  talla: varchar('talla', { length: 5 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  cantidad: integer('cantidad').notNull(),
  precio_unitario: decimal('precio_unitario', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});
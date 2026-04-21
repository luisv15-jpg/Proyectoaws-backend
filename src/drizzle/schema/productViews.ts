import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

export const productViews = pgTable('product_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
});
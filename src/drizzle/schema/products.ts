import { pgTable, varchar, integer, decimal, timestamp, boolean, uuid, text } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  categoria: varchar('categoria', { length: 50 }).notNull(),
  subcategoria: varchar('subcategoria', { length: 50 }),
  precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
  precio_oferta: decimal('precio_oferta', { precision: 10, scale: 2 }),
  imagen_principal: varchar('imagen_principal', { length: 500 }),
  imagenes: text('imagenes').array(),
  tallas: varchar('tallas', { length: 5 }).array(),
  colores: varchar('colores', { length: 50 }).array(),
  stock: integer('stock').default(0).notNull(),
  vendidos: integer('vendidos').default(0),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
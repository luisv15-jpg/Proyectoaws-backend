import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetupService {
  constructor(private drizzleService: DrizzleService) {}

  async createTables() {
    const db = await this.drizzleService.getDb();

    await db.execute(`CREATE TYPE "role" AS ENUM('admin', 'user');`);
    await db.execute(`CREATE TYPE "order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');`);
    await db.execute(`CREATE TYPE "payment_method" AS ENUM('tarjeta', 'yape', 'plin', 'transferencia');`);

    await db.execute(`
      CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role "role" DEFAULT 'user',
          dni VARCHAR(8),
          avatar VARCHAR(255),
          telefono VARCHAR(15),
          direccion VARCHAR(255),
          altura_cm INT,
          peso_kg INT,
          deleted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(200) NOT NULL,
          descripcion TEXT,
          categoria VARCHAR(50) NOT NULL,
          subcategoria VARCHAR(50),
          precio DECIMAL(10,2) NOT NULL,
          precio_oferta DECIMAL(10,2),
          imagen_principal VARCHAR(500),
          imagenes TEXT[],
          tallas VARCHAR(5)[],
          colores VARCHAR(50)[],
          stock INT DEFAULT 0,
          vendidos INT DEFAULT 0,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE cart_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          talla VARCHAR(5) NOT NULL,
          color VARCHAR(50) NOT NULL,
          cantidad INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          total DECIMAL(10,2) NOT NULL,
          estado "order_status" DEFAULT 'pending',
          metodo_pago "payment_method" NOT NULL,
          direccion_entrega VARCHAR(255) NOT NULL,
          tracking_number VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE  order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          product_name VARCHAR(200) NOT NULL,
          product_image VARCHAR(500),
          talla VARCHAR(5) NOT NULL,
          color VARCHAR(50) NOT NULL,
          cantidad INT NOT NULL,
          precio_unitario DECIMAL(10,2) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE  sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          refresh_token VARCHAR(500) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE  password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(500) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE  product_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          viewed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const adminPassword = await bcrypt.hash('Admin123!', 10);
    
    await db.execute(`
      INSERT INTO users (nombre, email, password, role) 
      VALUES ('Administrador', 'admin@tienda.com', '${adminPassword}', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

    return {
      message: 'Tablas creadas y usuario admin insertado exitosamente',
      admin: {
        email: 'admin@tienda.com',
        password: 'Admin123!'
      }
    };
  }
}
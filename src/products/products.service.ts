import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, sql, desc, asc, isNotNull } from 'drizzle-orm';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';
import { CreateProductDto, UpdateProductDto, FilterProductDto } from './dto';

@Injectable()
export class ProductsService extends BaseDrizzleService {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.db
      .select()
      .from(schema.products)
      .where(eq(schema.products.nombre, createProductDto.nombre))
      .limit(1);

    if (existingProduct.length > 0) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    const newProduct = await this.db
      .insert(schema.products)
      .values({
        nombre: createProductDto.nombre,
        descripcion: createProductDto.descripcion,
        categoria: createProductDto.categoria,
        subcategoria: createProductDto.subcategoria,
        precio: createProductDto.precio.toString(),
        precio_oferta: createProductDto.precio_oferta?.toString(),
        imagen_principal: createProductDto.imagen_principal,
        imagenes: createProductDto.imagenes,
        tallas: createProductDto.tallas,
        colores: createProductDto.colores,
        stock: createProductDto.stock || 0,
        activo: createProductDto.activo ?? true,
      })
      .returning();

    return { message: 'Producto creado exitosamente', product: newProduct[0] };
  }

  async findAll(filterDto: FilterProductDto) {
    const { 
      categoria, 
      subcategoria, 
      talla, 
      color, 
      precioMin, 
      precioMax, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = filterDto;
    
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (categoria) {
      conditions.push(eq(schema.products.categoria, categoria));
    }

    if (subcategoria) {
      conditions.push(eq(schema.products.subcategoria, subcategoria));
    }

    if (talla) {
      conditions.push(sql`${talla} = ANY(${schema.products.tallas})`);
    }

    if (color) {
      conditions.push(sql`${color} = ANY(${schema.products.colores})`);
    }

    if (precioMin !== undefined) {
      conditions.push(sql`CAST(${schema.products.precio} AS DECIMAL) >= ${precioMin}`);
    }

    if (precioMax !== undefined) {
      conditions.push(sql`CAST(${schema.products.precio} AS DECIMAL) <= ${precioMax}`);
    }

    if (search) {
      conditions.push(
        sql`(${schema.products.nombre} ILIKE ${`%${search}%`} OR ${schema.products.descripcion} ILIKE ${`%${search}%`})`
      );
    }

    conditions.push(eq(schema.products.activo, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderByColumn = schema.products[sortBy as keyof typeof schema.products];
    
    const products = await this.db
      .select()
      .from(schema.products)
      .where(whereClause)
      .orderBy(sortOrder === 'ASC' ? asc(orderByColumn as any) : desc(orderByColumn as any))
      .limit(limit)
      .offset(offset);

    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.products)
      .where(whereClause);

    return {
      products,
      total: Number(total[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0].count) / limit),
    };
  }

  async findAllAdmin(filterDto: FilterProductDto) {
    const { 
      categoria, 
      subcategoria, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = filterDto;
    
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (categoria) {
      conditions.push(eq(schema.products.categoria, categoria));
    }

    if (subcategoria) {
      conditions.push(eq(schema.products.subcategoria, subcategoria));
    }

    if (search) {
      conditions.push(
        sql`(${schema.products.nombre} ILIKE ${`%${search}%`} OR ${schema.products.descripcion} ILIKE ${`%${search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderByColumn = schema.products[sortBy as keyof typeof schema.products];
    
    const products = await this.db
      .select()
      .from(schema.products)
      .where(whereClause)
      .orderBy(sortOrder === 'ASC' ? asc(orderByColumn as any) : desc(orderByColumn as any))
      .limit(limit)
      .offset(offset);

    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.products)
      .where(whereClause);

    return {
      products,
      total: Number(total[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0].count) / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);

    if (product.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product[0];
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const updateData: any = {
      ...updateProductDto,
      updatedAt: new Date(),
    };

    if (updateProductDto.precio !== undefined) {
      updateData.precio = updateProductDto.precio.toString();
    }
    if (updateProductDto.precio_oferta !== undefined) {
      updateData.precio_oferta = updateProductDto.precio_oferta?.toString();
    }

    const updatedProduct = await this.db
      .update(schema.products)
      .set(updateData)
      .where(eq(schema.products.id, id))
      .returning();

    return { message: 'Producto actualizado exitosamente', product: updatedProduct[0] };
  }

  async softDelete(id: string) {
    await this.findOne(id);

    const deletedProduct = await this.db
      .update(schema.products)
      .set({
        activo: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();

    return { message: 'Producto desactivado exitosamente', product: deletedProduct[0] };
  }

  async restore(id: string) {
    const product = await this.db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);

    if (product.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    const restoredProduct = await this.db
      .update(schema.products)
      .set({
        activo: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();

    return { message: 'Producto activado exitosamente', product: restoredProduct[0] };
  }

  async getCategories() {
    const categories = await this.db
      .selectDistinct({ categoria: schema.products.categoria })
      .from(schema.products)
      .where(eq(schema.products.activo, true));

    return categories.map(c => c.categoria);
  }

  async getSubcategories(categoria: string) {
    const subcategories = await this.db
      .selectDistinct({ subcategoria: schema.products.subcategoria })
      .from(schema.products)
      .where(eq(schema.products.categoria, categoria));

    return subcategories.filter(s => s.subcategoria).map(s => s.subcategoria);
  }
}
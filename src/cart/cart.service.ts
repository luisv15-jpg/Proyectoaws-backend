import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsService } from '../products/products.service';
import * as schema from '../drizzle/schema';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService extends BaseDrizzleService {
  constructor(
    drizzleService: DrizzleService,
    private productsService: ProductsService,
  ) {
    super(drizzleService);
  }

  async getCart(userId: string) {
    const cartItems = await this.db
      .select({
        id: schema.cartItems.id,
        productId: schema.cartItems.productId,
        talla: schema.cartItems.talla,
        color: schema.cartItems.color,
        cantidad: schema.cartItems.cantidad,
        product: {
          id: schema.products.id,
          nombre: schema.products.nombre,
          precio: schema.products.precio,
          precio_oferta: schema.products.precio_oferta,
          imagen_principal: schema.products.imagen_principal,
          stock: schema.products.stock,
        },
      })
      .from(schema.cartItems)
      .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
      .where(eq(schema.cartItems.userId, userId));

    // Calcular totales
    let subtotal = 0;
    let total = 0;

    const itemsWithTotal = cartItems.map(item => {
      const precio = item.product.precio_oferta 
        ? parseFloat(item.product.precio_oferta) 
        : parseFloat(item.product.precio);
      const itemTotal = precio * item.cantidad;
      
      subtotal += itemTotal;
      total += itemTotal;

      return {
        ...item,
        precio_unitario: precio,
        item_total: itemTotal,
      };
    });

    return {
      items: itemsWithTotal,
      subtotal,
      total,
      total_items: cartItems.length,
      total_cantidad: cartItems.reduce((sum, item) => sum + item.cantidad, 0),
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    // Verificar que el producto existe
    const product = await this.productsService.findOne(dto.productId);

    if (!product.activo) {
      throw new BadRequestException('El producto no está disponible');
    }

    // Verificar stock
    if (product.stock < dto.cantidad) {
      throw new BadRequestException(`Stock insuficiente. Solo quedan ${product.stock} unidades`);
    }

    // Verificar si la talla está disponible
    if (product.tallas && !product.tallas.includes(dto.talla)) {
      throw new BadRequestException(`La talla ${dto.talla} no está disponible para este producto`);
    }

    // Verificar si el color está disponible
    if (product.colores && !product.colores.includes(dto.color)) {
      throw new BadRequestException(`El color ${dto.color} no está disponible para este producto`);
    }

    // Buscar si el item ya existe en el carrito
    const existingItem = await this.db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.userId, userId),
          eq(schema.cartItems.productId, dto.productId),
          eq(schema.cartItems.talla, dto.talla),
          eq(schema.cartItems.color, dto.color),
        ),
      )
      .limit(1);

    let cartItem;

    if (existingItem.length > 0) {
      // Actualizar cantidad
      const nuevaCantidad = existingItem[0].cantidad + dto.cantidad;
      
      if (product.stock < nuevaCantidad) {
        throw new BadRequestException(`Stock insuficiente. Solo quedan ${product.stock} unidades`);
      }

      const updated = await this.db
        .update(schema.cartItems)
        .set({
          cantidad: nuevaCantidad,
          updatedAt: new Date(),
        })
        .where(eq(schema.cartItems.id, existingItem[0].id))
        .returning();

      cartItem = updated[0];
    } else {
      // Crear nuevo item
      const newItem = await this.db
        .insert(schema.cartItems)
        .values({
          userId,
          productId: dto.productId,
          talla: dto.talla,
          color: dto.color,
          cantidad: dto.cantidad,
        })
        .returning();

      cartItem = newItem[0];
    }

    return {
      message: 'Producto agregado al carrito',
      cartItem,
    };
  }

  async updateCartItem(userId: string, dto: UpdateCartItemDto) {
    // Verificar que el item existe y pertenece al usuario
    const cartItem = await this.db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.id, dto.cartItemId),
          eq(schema.cartItems.userId, userId),
        ),
      )
      .limit(1);

    if (cartItem.length === 0) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    // Verificar stock del producto
    const product = await this.productsService.findOne(cartItem[0].productId);

    if (product.stock < dto.cantidad) {
      throw new BadRequestException(`Stock insuficiente. Solo quedan ${product.stock} unidades`);
    }

    const updated = await this.db
      .update(schema.cartItems)
      .set({
        cantidad: dto.cantidad,
        updatedAt: new Date(),
      })
      .where(eq(schema.cartItems.id, dto.cartItemId))
      .returning();

    return {
      message: 'Carrito actualizado',
      cartItem: updated[0],
    };
  }

  async removeCartItem(userId: string, cartItemId: string) {
    const cartItem = await this.db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.id, cartItemId),
          eq(schema.cartItems.userId, userId),
        ),
      )
      .limit(1);

    if (cartItem.length === 0) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    await this.db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.id, cartItemId));

    return {
      message: 'Producto eliminado del carrito',
    };
  }

  async clearCart(userId: string) {
    await this.db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.userId, userId));

    return {
      message: 'Carrito vaciado exitosamente',
    };
  }
}
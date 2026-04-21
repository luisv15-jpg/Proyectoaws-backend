import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import * as schema from '../drizzle/schema';
import { CreateOrderDto, UpdateOrderStatusDto, FilterOrderDto } from './dto';

@Injectable()
export class OrdersService extends BaseDrizzleService {
  constructor(
    drizzleService: DrizzleService,
    private productsService: ProductsService,
    private cartService: CartService,
  ) {
    super(drizzleService);
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { items, metodo_pago, direccion_entrega } = createOrderDto;

    if (items.length === 0) {
      throw new BadRequestException('El pedido debe tener al menos un item');
    }

    let total = 0;
    const orderItemsData: any[] = [];

    // Validar stock y calcular total
    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product.activo) {
        throw new BadRequestException(`El producto ${product.nombre} no está disponible`);
      }

      if (product.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
      }

      const precio = product.precio_oferta 
        ? parseFloat(product.precio_oferta) 
        : parseFloat(product.precio);
      
      const subtotal = precio * item.cantidad;
      total += subtotal;

      orderItemsData.push({
        productId: item.productId,
        productName: product.nombre,
        productImage: product.imagen_principal,
        talla: item.talla,
        color: item.color,
        cantidad: item.cantidad,
        precio_unitario: precio,
        subtotal: subtotal,
      });
    }

    // Crear el pedido
    const newOrder = await this.db
      .insert(schema.orders)
      .values({
        userId: userId,
        total: total.toString(),
        metodo_pago: metodo_pago as any,
        direccion_entrega: direccion_entrega,
        estado: 'pending',
      })
      .returning();

    const order = newOrder[0];

    // Crear los items del pedido
    for (const itemData of orderItemsData) {
      await this.db.insert(schema.orderItems).values({
        orderId: order.id,
        productId: itemData.productId,
        productName: itemData.productName,
        productImage: itemData.productImage,
        talla: itemData.talla,
        color: itemData.color,
        cantidad: itemData.cantidad,
        precio_unitario: itemData.precio_unitario.toString(),
        subtotal: itemData.subtotal.toString(),
      });
    }

    // Actualizar stock de productos
    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);
      await this.db
        .update(schema.products)
        .set({
          stock: product.stock - item.cantidad,
          vendidos: (product.vendidos || 0) + item.cantidad,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, item.productId));
    }

    // Limpiar el carrito del usuario
    await this.cartService.clearCart(userId);

    // Obtener el pedido completo con sus items
    const orderWithItems = await this.getOrderById(order.id);

    return {
      message: 'Pedido creado exitosamente',
      order: orderWithItems,
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const items = await this.db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));

    return {
      ...order[0],
      items,
    };
  }

  async getUserOrders(userId: string, filterDto: FilterOrderDto) {
    const { estado, page = 1, limit = 10 } = filterDto;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(schema.orders.userId, userId)];

    if (estado) {
      conditions.push(eq(schema.orders.estado, estado as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orders = await this.db
      .select()
      .from(schema.orders)
      .where(whereClause)
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Obtener items para cada pedido
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await this.db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(whereClause);

    return {
      orders: ordersWithItems,
      total: Number(total[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0].count) / limit),
    };
  }

  async getAllOrders(filterDto: FilterOrderDto) {
    const { estado, page = 1, limit = 10 } = filterDto;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (estado) {
      conditions.push(eq(schema.orders.estado, estado as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orders = await this.db
      .select()
      .from(schema.orders)
      .where(whereClause)
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Obtener items y datos de usuario para cada pedido
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const items = await this.db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
        
        const user = await this.db
          .select({
            id: schema.users.id,
            nombre: schema.users.nombre,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, order.userId as string))
          .limit(1);

        return { ...order, items, user: user[0] };
      })
    );

    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.orders)
      .where(whereClause);

    return {
      orders: ordersWithDetails,
      total: Number(total[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number(total[0].count) / limit),
    };
  }

  async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const updatedOrder = await this.db
      .update(schema.orders)
      .set({
        estado: updateStatusDto.estado as any,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    return {
      message: `Estado del pedido actualizado a ${updateStatusDto.estado}`,
      order: updatedOrder[0],
    };
  }
}
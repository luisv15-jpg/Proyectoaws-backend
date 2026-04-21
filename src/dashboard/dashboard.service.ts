import { Injectable } from '@nestjs/common';
import { eq, and, sql, desc, isNull, isNotNull, gte, lte } from 'drizzle-orm';
import { BaseDrizzleService } from '../drizzle/base-drizzle.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';

@Injectable()
export class DashboardService extends BaseDrizzleService {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async getOverview() {
    try {
      // Total de usuarios activos
      const totalUsers = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(isNull(schema.users.deletedAt));

      // Total de productos activos
      const totalProducts = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.products)
        .where(eq(schema.products.activo, true));

      // Total de pedidos
      const totalOrders = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders);

      // Ventas totales (solo pedidos entregados)
      const totalSales = await this.db
        .select({ sum: sql<string>`sum(${schema.orders.total})` })
        .from(schema.orders)
        .where(eq(schema.orders.estado, 'delivered'));

      // Pedidos pendientes
      const pendingOrders = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(eq(schema.orders.estado, 'pending'));

      // Pedidos en proceso
      const processingOrders = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.orders)
        .where(eq(schema.orders.estado, 'processing'));

      return {
        stats: {
          total_users: Number(totalUsers[0]?.count || 0),
          total_products: Number(totalProducts[0]?.count || 0),
          total_orders: Number(totalOrders[0]?.count || 0),
          total_sales: totalSales[0]?.sum ? parseFloat(totalSales[0].sum) : 0,
          pending_orders: Number(pendingOrders[0]?.count || 0),
          processing_orders: Number(processingOrders[0]?.count || 0),
        },
      };
    } catch (error) {
      console.error('Error in getOverview:', error);
      return {
        stats: {
          total_users: 0,
          total_products: 0,
          total_orders: 0,
          total_sales: 0,
          pending_orders: 0,
          processing_orders: 0,
        },
      };
    }
  }

  async getSalesByMonth(year?: number) {
    try {
      const currentYear = year || new Date().getFullYear();

      const sales = await this.db
        .select({
          month: sql<string>`EXTRACT(MONTH FROM ${schema.orders.createdAt})`,
          total: sql<string>`COALESCE(SUM(${schema.orders.total}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(schema.orders)
        .where(
          and(
            sql`EXTRACT(YEAR FROM ${schema.orders.createdAt}) = ${currentYear}`,
            eq(schema.orders.estado, 'delivered'),
          ),
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${schema.orders.createdAt})`)
        .orderBy(sql`EXTRACT(MONTH FROM ${schema.orders.createdAt})`);

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      const result = months.map((month, index) => {
        const monthIndex = index + 1;
        const sale = sales.find(s => Number(s.month) === monthIndex);
        return {
          month,
          total: sale ? parseFloat(sale.total) : 0,
          count: sale ? Number(sale.count) : 0,
        };
      });

      return result;
    } catch (error) {
      console.error('Error in getSalesByMonth:', error);
      return [];
    }
  }

  async getTopProducts(limit: number = 10) {
    try {
      const topProducts = await this.db
        .select({
          id: schema.products.id,
          nombre: schema.products.nombre,
          vendidos: schema.products.vendidos,
          stock: schema.products.stock,
          precio: schema.products.precio,
        })
        .from(schema.products)
        .orderBy(desc(schema.products.vendidos))
        .limit(limit);

      return topProducts;
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      return [];
    }
  }

  async getRecentOrders(limit: number = 10) {
    try {
      const recentOrders = await this.db
        .select({
          id: schema.orders.id,
          total: schema.orders.total,
          estado: schema.orders.estado,
          createdAt: schema.orders.createdAt,
          user: {
            nombre: schema.users.nombre,
            email: schema.users.email,
          },
        })
        .from(schema.orders)
        .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit);

      return recentOrders;
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return [];
    }
  }

  async getRecentUsers(limit: number = 10) {
    try {
      const recentUsers = await this.db
        .select({
          id: schema.users.id,
          nombre: schema.users.nombre,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .orderBy(desc(schema.users.createdAt))
        .limit(limit);

      return recentUsers;
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      return [];
    }
  }

  async getCategoryDistribution() {
    try {
      const distribution = await this.db
        .select({
          categoria: schema.products.categoria,
          count: sql<number>`count(*)`,
          sales: sql<number>`COALESCE(sum(${schema.products.vendidos}), 0)`,
        })
        .from(schema.products)
        .groupBy(schema.products.categoria)
        .orderBy(desc(sql`count(*)`));

      return distribution;
    } catch (error) {
      console.error('Error in getCategoryDistribution:', error);
      return [];
    }
  }

  async getOrderStatusDistribution() {
    try {
      const distribution = await this.db
        .select({
          estado: schema.orders.estado,
          count: sql<number>`count(*)`,
          total: sql<string>`COALESCE(sum(${schema.orders.total}), 0)`,
        })
        .from(schema.orders)
        .groupBy(schema.orders.estado);

      return distribution;
    } catch (error) {
      console.error('Error in getOrderStatusDistribution:', error);
      return [];
    }
  }

  async getDailySales(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const sales = await this.db
      .select({
        date: sql<string>`DATE(${schema.orders.createdAt})`.as('date'),
        total: sql<string>`COALESCE(SUM(${schema.orders.total}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(schema.orders)
      .where(
        and(
          gte(schema.orders.createdAt, startDate),
          lte(schema.orders.createdAt, endDate),
          eq(schema.orders.estado, 'delivered'),
        ),
      )
      .groupBy(sql`DATE(${schema.orders.createdAt})`)
      .orderBy(sql`DATE(${schema.orders.createdAt})`);

    const salesMap = new Map();

    sales.forEach(sale => {
      salesMap.set(sale.date, {
        total: Number(sale.total) || 0,
        count: Number(sale.count),
      });
    });

    return dates.map(date => ({
      date,
      total: salesMap.get(date)?.total || 0,
      count: salesMap.get(date)?.count || 0,
    }));
  } catch (error) {
    console.error('Error in getDailySales:', error);
    return [];
  }
}

}
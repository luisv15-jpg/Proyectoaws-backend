import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('sales-by-month')
  async getSalesByMonth(@Query('year') year?: number) {
    return this.dashboardService.getSalesByMonth(year);
  }

  @Get('top-products')
  async getTopProducts(@Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(limit || 10);
  }

  @Get('recent-orders')
  async getRecentOrders(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentOrders(limit || 10);
  }

  @Get('recent-users')
  async getRecentUsers(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentUsers(limit || 10);
  }

  @Get('category-distribution')
  async getCategoryDistribution() {
    return this.dashboardService.getCategoryDistribution();
  }

  @Get('order-status-distribution')
  async getOrderStatusDistribution() {
    return this.dashboardService.getOrderStatusDistribution();
  }

  @Get('daily-sales')
  async getDailySales(@Query('days') days?: number) {
    return this.dashboardService.getDailySales(days || 30);
  }
}
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderDto, UpdateOrderStatusDto, FilterOrderDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============================================
  // RUTAS DE USUARIO
  // ============================================

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'))
  async getUserOrders(@Request() req, @Query() filterDto: FilterOrderDto) {
    return this.ordersService.getUserOrders(req.user.id, filterDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  // ============================================
  // RUTAS DE ADMIN
  // ============================================

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllOrders(@Query() filterDto: FilterOrderDto) {
    return this.ordersService.getAllOrders(filterDto);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateOrderStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto);
  }
}
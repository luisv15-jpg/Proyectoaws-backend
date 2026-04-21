import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put()
  async updateCartItem(@Request() req, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(req.user.id, updateCartItemDto);
  }

  @Delete(':cartItemId')
  async removeCartItem(@Request() req, @Param('cartItemId') cartItemId: string) {
    return this.cartService.removeCartItem(req.user.id, cartItemId);
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
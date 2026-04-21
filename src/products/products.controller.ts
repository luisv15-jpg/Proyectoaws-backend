import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto, UpdateProductDto, FilterProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================
  // RUTAS PÚBLICAS (cualquiera puede ver)
  // ============================================

  @Get()
  async findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('subcategories')
  async getSubcategories(@Query('categoria') categoria: string) {
    return this.productsService.getSubcategories(categoria);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ============================================
  // RUTAS DE ADMIN (requieren token + rol admin)
  // ============================================

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findAllAdmin(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAllAdmin(filterDto);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/soft-delete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }
}
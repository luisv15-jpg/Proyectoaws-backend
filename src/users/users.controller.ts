import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto, UpdateBodyMeasurementsDto, CreateUserDto, UpdateRoleDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('deleted')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findDeleted() {
    return this.usersService.findDeleted();
  }

  @Get('all-with-deleted')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findAllWithDeleted() {
    return this.usersService.findAllWithDeleted();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Patch(':id/soft-delete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile/me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Put('profile/body-measurements')
  @UseGuards(AuthGuard('jwt'))
  async updateBodyMeasurements(@Request() req, @Body() dto: UpdateBodyMeasurementsDto) {
    return this.usersService.updateBodyMeasurements(req.user.id, dto);
  }
}
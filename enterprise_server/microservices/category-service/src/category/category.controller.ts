import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Post()
  create(@Body() data: CreateCategoryDto) {
    return this.service.create(data);
  }

  @Get()
  async findAll() {
    const categories = await this.service.findAll();
    return { categories };
  }

  @Get('active')
  async findActive() {
    const categories = await this.service.findActive();
    return { categories };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.service.findOne(id);
    return { category };
  }

  @Get(':id/products')
  async findWithProducts(@Param('id') id: string) {
    const category = await this.service.findWithProducts(id);
    return { category };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    const category = await this.service.update(id, data);
    return { category };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Category deleted successfully' };
  }
}

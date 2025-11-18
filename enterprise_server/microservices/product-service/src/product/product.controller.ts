import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  async create(@Body() data: CreateProductDto) {
    const product = await this.service.create(data);
    return { product };
  }

  @Get()
  async findAll(@Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    const products = await this.service.findAll({ categoryId, status });
    return { products };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.service.findOne(id);
    return { product };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    const product = await this.service.update(id, data);
    return { product };
  }

  @Put(':id/stock')
  async updateStock(@Param('id') id: string, @Body() body: { quantity: number; operation: 'add' | 'subtract' }) {
    const product = await this.service.updateStock(id, body.quantity, body.operation);
    return { product };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Product deleted successfully' };
  }
}

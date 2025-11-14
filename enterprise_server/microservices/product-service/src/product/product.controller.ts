import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  create(@Body() data: CreateProductDto) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    return this.service.findAll({ categoryId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.service.update(id, data);
  }

  @Put(':id/stock')
  updateStock(@Param('id') id: string, @Body() body: { quantity: number; operation: 'add' | 'subtract' }) {
    return this.service.updateStock(id, body.quantity, body.operation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...data,
        stockAvailable: data.stockTotal || 0,
        status: data.status || 'draft',
      },
    });
  }

  findAll(filters?: { categoryId?: string; status?: string }) {
    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    return this.prisma.product.findMany({ where });
  }

  async findOne(id: string) {
    const item = await this.prisma.product.findUnique({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract') {
    const product = await this.findOne(id);
    let newStock = operation === 'add' ? product.stockAvailable + quantity : product.stockAvailable - quantity;
    if (newStock < 0) throw new BadRequestException();
    return this.prisma.product.update({
      where: { id },
      data: { stockAvailable: newStock, status: newStock === 0 ? 'soldout' : product.status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}

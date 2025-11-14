import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCategoryDto) {
    return this.prisma.productCategory.create({
      data: { ...data, isActive: data.isActive !== undefined ? data.isActive : true },
    });
  }

  findAll() {
    return this.prisma.productCategory.findMany();
  }

  findActive() {
    return this.prisma.productCategory.findMany({ where: { isActive: true } });
  }

  async findOne(id: string) {
    const item = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async findWithProducts(id: string) {
    const item = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { products: { where: { status: 'active' } } },
    });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.productCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    const count = await this.prisma.product.count({ where: { categoryId: id } });
    if (count > 0) throw new BadRequestException();
    return this.prisma.productCategory.delete({ where: { id } });
  }
}

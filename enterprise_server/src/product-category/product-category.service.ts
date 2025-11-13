import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}
}

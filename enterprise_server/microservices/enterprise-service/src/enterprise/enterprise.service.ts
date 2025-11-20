import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import * as argon2 from 'argon2';

@Injectable()
export class EnterpriseService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEnterpriseDto) {
    const hashedPassword = await argon2.hash(data.password);
    return this.prisma.enterprise.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.enterprise.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.enterprise.findUnique({ where: { id } });
    if (!item) throw new NotFoundException();
    return item;
  }

  async update(id: string, data: UpdateEnterpriseDto) {
    await this.findOne(id);
    return this.prisma.enterprise.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.enterprise.delete({ where: { id } });
  }
}

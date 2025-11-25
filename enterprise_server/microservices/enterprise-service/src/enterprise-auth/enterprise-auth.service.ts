import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginEnterpriseDto } from './dto/login-enterprise.dto';
import { UpdateEnterpriseAuthDto } from './dto/update-enterprise-auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class EnterpriseAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(data: LoginEnterpriseDto) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const enterprise = await this.prisma.enterprise.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!enterprise) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await argon2.verify(enterprise.password, data.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (enterprise.status !== 'active') {
      throw new UnauthorizedException('Enterprise not active');
    }

    const token = this.jwtService.sign({
      id: enterprise.id,
      uid: enterprise.uid,
      role: 'enterprise',
    });

    const { password: _, ...enterpriseData } = enterprise;

    return { enterprise: enterpriseData, token };
  }

  async getMe(id: string) {
    const enterprise = await this.prisma.enterprise.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundException();
    const { password: _, ...enterpriseData } = enterprise;
    return { enterprise: enterpriseData };
  }

  async updateMe(id: string, data: UpdateEnterpriseAuthDto) {
    const updateData: any = { ...data };

    if (data.password) {
      if (data.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      updateData.password = await argon2.hash(data.password);
    }

    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }

    const enterprise = await this.prisma.enterprise.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...enterpriseData } = enterprise;
    return { enterprise: enterpriseData };
  }
}

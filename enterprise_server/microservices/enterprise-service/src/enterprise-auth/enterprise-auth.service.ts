import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginEnterpriseDto } from './dto/login-enterprise.dto';
import { UpdateEnterpriseAuthDto } from './dto/update-enterprise-auth.dto';

@Injectable()
export class EnterpriseAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginEnterpriseDto) {
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { uid: data.uid },
    });

    if (!enterprise) throw new UnauthorizedException();

    // Por ahora sin password - implementación simple
    // En el futuro agregar campo password al schema y validar aquí

    if (enterprise.status !== 'active') {
      throw new UnauthorizedException('Enterprise not active');
    }

    const token = this.jwtService.sign({
      id: enterprise.id,
      uid: enterprise.uid,
      role: 'enterprise',
    });

    return { enterprise, token };
  }

  async getMe(id: string) {
    const enterprise = await this.prisma.enterprise.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundException();
    return { enterprise };
  }

  async updateMe(id: string, data: UpdateEnterpriseAuthDto) {
    const enterprise = await this.prisma.enterprise.update({
      where: { id },
      data,
    });
    return { enterprise };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { EnterpriseAuthModule } from './enterprise-auth/enterprise-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EnterpriseModule,
    EnterpriseAuthModule,
  ],
})
export class AppModule {}

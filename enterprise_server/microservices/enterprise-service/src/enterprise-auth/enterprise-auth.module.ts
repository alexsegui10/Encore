import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnterpriseAuthController } from './enterprise-auth.controller';
import { EnterpriseAuthService } from './enterprise-auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'enterprise-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EnterpriseAuthController],
  providers: [EnterpriseAuthService],
})
export class EnterpriseAuthModule {}

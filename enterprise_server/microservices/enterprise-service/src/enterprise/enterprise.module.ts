import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseRoleMiddleware } from '../enterprise-auth/enterprise-role.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'enterprise-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EnterpriseController],
  providers: [EnterpriseService, EnterpriseRoleMiddleware],
  exports: [EnterpriseService],
})
export class EnterpriseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnterpriseRoleMiddleware)
      .forRoutes(
        { path: '', method: RequestMethod.POST },
        { path: ':id', method: RequestMethod.PUT },
        { path: ':id', method: RequestMethod.DELETE },
      );
  }
}

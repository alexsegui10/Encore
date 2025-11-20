import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { EnterpriseRoleMiddleware } from './enterprise-role.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'enterprise-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, EnterpriseRoleMiddleware],
  exports: [CategoryService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnterpriseRoleMiddleware)
      .forRoutes(
        { path: 'category', method: RequestMethod.POST },
        { path: 'category/:id', method: RequestMethod.PUT },
        { path: 'category/:id', method: RequestMethod.DELETE },
      );
  }
}

import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { EnterpriseRoleMiddleware } from './enterprise-role.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'enterprise-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, EnterpriseRoleMiddleware],
  exports: [ProductService],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnterpriseRoleMiddleware)
      .forRoutes(
        { path: 'product', method: RequestMethod.POST },
        { path: 'product/:id', method: RequestMethod.PUT },
        { path: 'product/:id', method: RequestMethod.PATCH },
        { path: 'product/:id/stock', method: RequestMethod.PUT },
        { path: 'product/:id/stock', method: RequestMethod.PATCH },
        { path: 'product/:id', method: RequestMethod.DELETE },
      );
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterpriseService } from './enterprise/enterprise.service';
import { EnterpriseController } from './enterprise/enterprise.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProductCategoryService } from './product-category/product-category.service';
import { ProductCategoryController } from './product-category/product-category.controller';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, EnterpriseController, ProductCategoryController, ProductController],
  providers: [AppService, EnterpriseService, ProductCategoryService, ProductService],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder().setTitle('Category API').setVersion('1.0').build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  const port = configService.get<number>('PORT') || 5003;
  await app.listen(port);
  console.log(`Category Service on http://localhost:${port}`);
}

bootstrap();

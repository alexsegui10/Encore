import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Puerto y host
  const port = process.env.PORT || 5000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(5000);

  console.log(`Enterprise Server running on http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: 
    ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
}

bootstrap().catch((error) => {
  console.error(' Error starting server:', error);
  process.exit(1);
});

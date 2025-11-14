import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

/**
 * Módulo raíz del API Gateway
 * 
 * Responsabilidades:
 * - Configurar variables de entorno (.env)
 * - Registrar el health check controller
 * - Los proxies a microservicios se configuran en main.ts
 */
@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

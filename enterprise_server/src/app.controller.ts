import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      services: {
        enterprise: 'http://localhost:5001',
        product: 'http://localhost:5002',
        category: 'http://localhost:5003',
      },
    };
  }
}

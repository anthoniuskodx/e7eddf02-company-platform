import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string } {
    return { message: 'Hello from NestJS Backend API!' };
  }

  @Get('health')
  health(): { status: string; timestamp: number } {
    return { status: 'ok', timestamp: Date.now() };
  }
}

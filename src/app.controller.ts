import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('slow')
  async getSlowResponse(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return 'This was a slow response';
  }

  @Get('error')
  getError(): string {
    throw new Error('This is a test error');
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService, type HealthMessage } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): HealthMessage {
    return this.appService.getRootMessage();
  }
}

import { Controller, Get } from '@nestjs/common';
import { SetupService } from './setup.service';

@Controller('setup')
export class SetupController {
  constructor(private setupService: SetupService) {}

  @Get('create-tables')
  async createTables() {
    return this.setupService.createTables();
  }
}
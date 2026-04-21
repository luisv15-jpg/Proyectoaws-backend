import { Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { BaseDrizzleService } from './base-drizzle.service';
@Module({
  providers: [DrizzleService, BaseDrizzleService],
  exports: [DrizzleService, BaseDrizzleService],
})
export class DrizzleModule {}

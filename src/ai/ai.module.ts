import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PersonalizeService } from './personalize.service';
import { ProductsModule } from '../products/products.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule, ProductsModule],
  controllers: [AiController],
  providers: [AiService, PersonalizeService],
  exports: [AiService, PersonalizeService],
})
export class AiModule {}
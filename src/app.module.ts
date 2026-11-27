import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AiModule } from './ai/ai.module';
import { MailModule } from './mail/mail.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { SetupModule } from './scripts/setup.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule,
    AuthModule,
    MailModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    DashboardModule,
    HealthModule,
    SetupModule,
    UploadsModule,
    AiModule,
  ],
})
export class AppModule {}

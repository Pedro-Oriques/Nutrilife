import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { RecoveryModule } from './user/recovery.module';
import { ProfileModule } from './profile/profile.module';
import { FoodModule } from './food/food.module';
import { DailyTrackingModule } from './daily-tracking/daily-tracking.module';
import { UserService } from './user/services/user.service';
import { WaterModule } from './water/water.module';
import { ReportModule } from './report/report.module';
import { FavoriteMealModule } from './favorite-meal/favorite-meal.module';
import { WeightModule } from './weight/weight.module';
import { GamificationModule } from './gamification/gamification.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    ThrottlerModule.forRoot([
      {
        ttl: 6000,
        limit: 100,
      },
    ]),
    UserModule,
    AdminModule,
    AuthModule,
    RecoveryModule,
    ProfileModule,
    FoodModule,
    DailyTrackingModule,
    WaterModule,
    ReportModule,
    FavoriteMealModule,
    WeightModule,
    GamificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) {}

  async onModuleInit() {
    const sysadminEmail = 'sysadmin@qacoders.com';
    const sysadminExists = await this.userService.findByEmail(sysadminEmail);

    if (!sysadminExists) {
      await this.userService.createUser({
        fullName: 'Administrador',
        email: sysadminEmail,
        password: '1234@Test',
        confirmPassword: '1234@Test',
        role: 'admin',
      });
      console.log('✅ Sysadmin user created automatically on startup');
    }
  }
}

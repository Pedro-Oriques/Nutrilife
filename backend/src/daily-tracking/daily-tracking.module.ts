import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DailyTracking,
  DailyTrackingSchema,
} from './schemas/daily-tracking.schema';
import { DailyTrackingService } from './services/daily-tracking.service';
import { DailyTrackingController } from './controllers/daily-tracking.controller';
import { FoodModule } from '../food/food.module';
import { ProfileModule } from 'src/profile/profile.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyTracking.name, schema: DailyTrackingSchema },
    ]),
    FoodModule,
    ProfileModule,
    forwardRef(() => GamificationModule),
  ],
  controllers: [DailyTrackingController],
  providers: [DailyTrackingService],
  exports: [DailyTrackingService],
})
export class DailyTrackingModule {}

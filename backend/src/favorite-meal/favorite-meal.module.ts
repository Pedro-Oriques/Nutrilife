import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DailyTrackingModule } from '../daily-tracking/daily-tracking.module';
import {
  FavoriteMeal,
  FavoriteMealSchema,
} from './schemas/favorite-meal.schema';
import { FavoriteMealService } from './services/favorite-meal.service';
import { FavoriteMealController } from './controllers/favorite-meal.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FavoriteMeal.name, schema: FavoriteMealSchema },
    ]),
    DailyTrackingModule, // Importamos para poder usar o addEntry do DailyTrackingService
  ],
  controllers: [FavoriteMealController],
  providers: [FavoriteMealService],
})
export class FavoriteMealModule {}

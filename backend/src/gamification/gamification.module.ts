import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsRecord, PointsRecordSchema } from './schemas/points-record.schema';
import { Water, WaterSchema } from '../water/schemas/water.schema';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PointsRecord.name, schema: PointsRecordSchema },
      { name: Water.name, schema: WaterSchema },
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

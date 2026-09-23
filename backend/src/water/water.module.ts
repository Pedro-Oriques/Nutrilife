import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaterController } from './water.controller';
import { WaterService } from './services/water.service';
import { Water, WaterSchema } from './schemas/water.schema';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Water.name, schema: WaterSchema }]),
    forwardRef(() => GamificationModule),
  ],
  controllers: [WaterController],
  providers: [WaterService],
})
export class WaterModule {}

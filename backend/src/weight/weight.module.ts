import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeightEntry, WeightEntrySchema } from './schemas/weight-entry.schema';
import { WeightController } from './controllers/weight.controller';
import { WeightService } from './services/weight.service';
import { ProfileModule } from 'src/profile/profile.module';
import { GamificationModule } from 'src/gamification/gamification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeightEntry.name, schema: WeightEntrySchema },
    ]),
    forwardRef(() => ProfileModule),
    forwardRef(() => GamificationModule),
  ],
  controllers: [WeightController],
  providers: [WeightService],
  exports: [WeightService],
})
export class WeightModule {}

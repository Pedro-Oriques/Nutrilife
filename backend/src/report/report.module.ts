import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ProfileModule } from '../profile/profile.module';
import {
  DailyTracking,
  DailyTrackingSchema,
} from '../daily-tracking/schemas/daily-tracking.schema';

@Module({
  imports: [
    ProfileModule,
    MongooseModule.forFeature([
      { name: DailyTracking.name, schema: DailyTrackingSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}

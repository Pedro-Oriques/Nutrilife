import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddWaterDto } from '../dtos/add-water.dto';
import { Water, WaterDocument } from '../schemas/water.schema';
import { GamificationService } from '../../gamification/gamification.service';

@Injectable()
export class WaterService {
  constructor(
    @InjectModel(Water.name) private readonly waterModel: Model<WaterDocument>,
    @Inject(forwardRef(() => GamificationService))
    private readonly gamificationService: GamificationService,
  ) {}

  async addWater(userId: string, dto: AddWaterDto): Promise<Water> {
    let waterRecord = await this.waterModel.findOne({
      userId: new Types.ObjectId(userId),
      date: dto.date,
    });

    if (waterRecord) {
      waterRecord.consumedMl = Math.max(0, waterRecord.consumedMl + dto.amountMl);
      return waterRecord.save();
    } else {
      const newWater = new this.waterModel({
        userId: new Types.ObjectId(userId),
        date: dto.date,
        consumedMl: Math.max(0, dto.amountMl),
      });
      const saved = await newWater.save();
      try {
        await this.gamificationService.awardPoints(userId, 'agua', dto.date);
      } catch (err) {
        console.error('Failed to award water points:', err);
      }
      return saved;
    }
  }

  async getWaterByDate(userId: string, date: string): Promise<Water | null> {
    return this.waterModel
      .findOne({
        userId: new Types.ObjectId(userId),
        date: date,
      })
      .exec();
  }
}

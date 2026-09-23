import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WeightEntry, WeightEntryDocument } from '../schemas/weight-entry.schema';
import { CreateWeightDto } from '../dtos/create-weight.dto';
import { ProfileService } from 'src/profile/services/profile.services';
import { GamificationService } from 'src/gamification/gamification.service';

@Injectable()
export class WeightService {
  constructor(
    @InjectModel(WeightEntry.name)
    private weightEntryModel: Model<WeightEntryDocument>,
    @Inject(forwardRef(() => ProfileService))
    private profileService: ProfileService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  async create(userId: string, dto: CreateWeightDto): Promise<WeightEntry> {
    const entry = new this.weightEntryModel({
      userId: new Types.ObjectId(userId),
      weight: dto.weight,
      recordedAt: new Date(),
    });
    const saved = await entry.save();
    await this.profileService.updateWeight(userId, dto.weight);
    try {
      await this.gamificationService.awardPoints(userId, 'peso');
    } catch (err) {
      console.error('Failed to award weight points:', err);
    }
    return saved;
  }

  async findAllByUser(userId: string): Promise<WeightEntry[]> {
    return this.weightEntryModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ recordedAt: -1 })
      .exec();
  }

  async delete(userId: string, id: string): Promise<void> {
    const entry = await this.weightEntryModel.findById(id).exec();
    if (!entry || entry.userId.toString() !== userId) {
      throw new NotFoundException('Registro de peso não encontrado.');
    }
    await this.weightEntryModel.findByIdAndDelete(id).exec();
  }
}

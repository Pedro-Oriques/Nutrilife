import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../schemas/profile.schema';
import { CreateProfileDto } from '../dtos/profile.dto';
import { WeightService } from 'src/weight/services/weight.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @Inject(forwardRef(() => WeightService))
    private weightService: WeightService,
  ) {}

  async createOrUpdate(
    userId: string,
    dto: CreateProfileDto,
  ): Promise<Profile> {
    const age = this.calculateAge(new Date(dto.birthDate));
    if (age < 1 || age > 120) {
      throw new BadRequestException(
        'A idade informada deve estar entre 1 e 120 anos.',
      );
    }

    if (
      dto.foodRestrictions &&
      dto.foodRestrictions.includes('Sem restrições') &&
      dto.foodRestrictions.length > 1
    ) {
      throw new BadRequestException(
        'A opção "Sem restrições" não pode ser combinada com outras seleções.',
      );
    }

    const existingProfile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    const calculationPayload = {
      ...existingProfile?.toObject(),
      ...dto,
    };

    const goals = this.calculateGoals(calculationPayload);

    const profile = await this.profileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        ...dto,
        userId: new Types.ObjectId(userId),
        dailyCalorieGoal: goals.calories,
        proteinGoal: goals.proteins,
        carbsGoal: goals.carbohydrates,
        fatGoal: goals.fats,
        dailyWaterGoal: goals.waterGoal,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    if (
      dto.weight !== undefined &&
      dto.weight !== existingProfile?.weight
    ) {
      await this.weightService.create(userId, { weight: dto.weight });
    }

    return profile;
  }

  public calculateGoals(profileDto: any): {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    waterGoal: number;
  } {
    const { birthDate, weight, height, gender, physicalActivity, goal } =
      profileDto;
    const age = this.calculateAge(new Date(birthDate));

    let bmr = 10 * weight + 6.25 * height - 5 * age;

    if (gender === 'Masculino') {
      bmr += 5;
    } else if (gender === 'Feminino') {
      bmr -= 161;
    }

    const activityMultipliers: Record<string, number> = {
      Sedentário: 1.2,
      'Pouco ativo': 1.375,
      Ativo: 1.55,
      'Muito Ativo': 1.725,
      'Extremamente Ativo': 1.9,
    };

    const tdee = bmr * (activityMultipliers[physicalActivity] || 1.2);

    let dailyCalorieTarget = tdee;

    switch (goal) {
      case 'Perda de peso':
        dailyCalorieTarget -= 500;
        break;
      case 'Ganho de massa':
        dailyCalorieTarget += 300;
        break;
      case 'Manter saúde':
      default:
        break;
    }

    const baseWater = Math.round(weight * 35);

    let waterBonus = 0;
    if (physicalActivity === 'Pouco ativo') waterBonus = 250;
    else if (physicalActivity === 'Ativo') waterBonus = 500;
    else if (physicalActivity === 'Muito Ativo') waterBonus = 750;
    else if (physicalActivity === 'Extremamente Ativo') waterBonus = 1000;

    const dailyWaterGoal = baseWater + waterBonus;

    const dailyCalories = Math.max(Math.round(dailyCalorieTarget), 1200);

    let proteinPercentage = 30;
    let carbPercentage = 45;
    let fatPercentage = 25;

    if (goal === 'Ganho de massa') {
      proteinPercentage = 35;
      carbPercentage = 45;
      fatPercentage = 20;
    } else if (goal === 'Perda de peso') {
      proteinPercentage = 35;
      carbPercentage = 40;
      fatPercentage = 25;
    }

    const proteins = Math.round((dailyCalories * proteinPercentage) / 100 / 4);
    const carbohydrates = Math.round(
      (dailyCalories * carbPercentage) / 100 / 4,
    );
    const fats = Math.round((dailyCalories * fatPercentage) / 100 / 9);

    return {
      calories: dailyCalories,
      proteins,
      carbohydrates,
      fats,
      waterGoal: dailyWaterGoal,
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async findByUserId(userId: string): Promise<Profile> {
    return this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async updateWeight(userId: string, weight: number): Promise<Profile> {
    return this.profileModel
      .findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { weight }, { new: true })
      .exec();
  }
}

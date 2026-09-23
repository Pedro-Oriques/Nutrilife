import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DailyTracking,
  DailyTrackingDocument,
} from '../schemas/daily-tracking.schema';
import { AddFoodEntryDto } from '../dtos/add-food-entry.dto';
import { FoodService } from '../../food/services/food.service';
import { DAILY_TRACKING_MESSAGES } from '../messages/daily-tracking.message';
import { ProfileService } from 'src/profile/services/profile.services';
import { GamificationService } from '../../gamification/gamification.service';

@Injectable()
export class DailyTrackingService {
  constructor(
    @InjectModel(DailyTracking.name)
    private dailyTrackingModel: Model<DailyTrackingDocument>,
    private foodService: FoodService,
    private profileService: ProfileService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  private convertToGrams(quantity: number, unit: string): number {
    switch (unit) {
      case 'g':
        return quantity;
      case 'kg':
        return quantity * 1000;
      case 'ml':
        return quantity;
      case 'L':
        return quantity * 1000;
      case 'mg':
        return quantity / 1000;
      case 'mcg':
        return quantity / 1000000;
      default:
        throw new BadRequestException('Unidade inválida.');
    }
  }

  private calculateNutrient(
    valuePer100g: number = 0,
    quantityInGrams: number,
  ): number {
    if (!valuePer100g) return 0;
    return (valuePer100g / 100) * quantityInGrams;
  }

  async addEntry(
    userId: string,
    addFoodEntryDto: AddFoodEntryDto,
  ): Promise<DailyTracking> {
    const food = await this.foodService.findById(addFoodEntryDto.foodId);
    if (!food) {
      throw new NotFoundException(DAILY_TRACKING_MESSAGES.FOOD_NOT_FOUND);
    }

    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Perfil não encontrado. Responda ao questionário primeiro.',
      );
    }

    const quantityInGrams = this.convertToGrams(
      addFoodEntryDto.quantity,
      addFoodEntryDto.unit,
    );

    const newEntryCalories = this.calculateNutrient(
      food.caloriesPer100g,
      quantityInGrams,
    );
    const newEntryProtein = this.calculateNutrient(
      food.protein,
      quantityInGrams,
    );
    const newEntryCarbs = this.calculateNutrient(food.carbs, quantityInGrams);
    const newEntryFat = this.calculateNutrient(food.fat, quantityInGrams);

    const targetDate = addFoodEntryDto.date
      ? new Date(addFoodEntryDto.date)
      : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const todaysEntries = await this.dailyTrackingModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: targetDate, $lt: nextDay },
      })
      .exec();

    const entryData = {
      userId: new Types.ObjectId(userId),
      foodId: new Types.ObjectId(addFoodEntryDto.foodId),
      foodName: food.name,
      calories: Math.round(newEntryCalories * 100) / 100,
      protein: Math.round(newEntryProtein * 100) / 100, // Salvando no banco arredondado
      carbs: Math.round(newEntryCarbs * 100) / 100,
      fat: Math.round(newEntryFat * 100) / 100,
      quantity: addFoodEntryDto.quantity,
      unit: addFoodEntryDto.unit,
      mealSession: addFoodEntryDto.mealSession,
      date: addFoodEntryDto.date ? new Date(addFoodEntryDto.date) : new Date(),
    };

    const createdEntry = new this.dailyTrackingModel(entryData);
    const saved = await createdEntry.save();

    const mealToActionType: Record<string, string> = {
      cafe_da_manha: 'cafe_da_manha',
      almoco: 'almoco',
      jantar: 'jantar',
      lanche_manha: 'lanche',
      lanche_tarde: 'lanche',
      ceia: 'lanche',
    };
    const actionType = mealToActionType[addFoodEntryDto.mealSession];
    if (actionType) {
      const entryDateStr = addFoodEntryDto.date
        ? new Date(addFoodEntryDto.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      try {
        await this.gamificationService.awardPoints(userId, actionType as any, entryDateStr);
      } catch (err) {
        console.error('Failed to award meal points:', err);
      }
    }

    return saved;
  }

  async getDailyTracking(userId: string, date?: string): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const profile = await this.profileService.findByUserId(userId);
    const dailyCalorieGoal = profile ? profile.dailyCalorieGoal : 0;

    const entries = await this.dailyTrackingModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: targetDate, $lt: nextDay },
      })
      .sort({ mealSession: 1, createdAt: 1 })
      .exec();

    const mealSessions = [
      'cafe_da_manha',
      'lanche_manha',
      'almoco',
      'lanche_tarde',
      'jantar',
      'ceia',
    ];
    const grouped: Record<string, any[]> = {};

    mealSessions.forEach((session) => {
      grouped[session] = [];
    });

    entries.forEach((entry) => {
      if (grouped[entry.mealSession]) {
        grouped[entry.mealSession].push(entry);
      }
    });

    const totalCalories = entries.reduce(
      (sum, entry) => sum + entry.calories,
      0,
    );
    const totalProtein = entries.reduce(
      (sum, entry) => sum + (entry.protein || 0),
      0,
    );
    const totalCarbs = entries.reduce(
      (sum, entry) => sum + (entry.carbs || 0),
      0,
    );
    const totalFat = entries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalCalories: Math.round(totalCalories * 100) / 100,
      totalProtein: Math.round(totalProtein * 100) / 100,
      totalCarbs: Math.round(totalCarbs * 100) / 100,
      totalFat: Math.round(totalFat * 100) / 100,
      dailyCalorieGoal: dailyCalorieGoal,
      availableCalories: Math.max(
        0,
        Math.round((dailyCalorieGoal - totalCalories) * 100) / 100,
      ),
      meals: grouped,
    };
  }

  async removeEntry(userId: string, entryId: string): Promise<void> {
    const entry = await this.dailyTrackingModel.findById(entryId).exec();

    if (!entry)
      throw new NotFoundException(DAILY_TRACKING_MESSAGES.ENTRY_NOT_FOUND);
    if (entry.userId.toString() !== userId)
      throw new UnauthorizedException(DAILY_TRACKING_MESSAGES.UNAUTHORIZED);

    await this.dailyTrackingModel.findByIdAndDelete(entryId).exec();
  }
}

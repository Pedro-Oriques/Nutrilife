import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProfileService } from 'src/profile/services/profile.services';
import { GetReportDto } from '../dtos/get-report.dto';
import {
  DailyTracking,
  DailyTrackingDocument,
} from 'src/daily-tracking/schemas/daily-tracking.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(DailyTracking.name)
    private dailyTrackingModel: Model<DailyTrackingDocument>,
    private profileService: ProfileService,
  ) {}

  async generateReport(userId: string, query: GetReportDto) {
    const { startDate, endDate, page, limit } = query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (end.getTime() < start.getTime()) {
      throw new BadRequestException(
        'A data final não pode ser anterior à data inicial.',
      );
    }

    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil do usuário não encontrado.');
    }

    const timeDiff = end.getTime() - start.getTime();
    const daysInPeriod = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
    const expectedTotalCalories = profile.dailyCalorieGoal * daysInPeriod;

    const entries = await this.dailyTrackingModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .exec();

    const toLocalDateStr = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const chartDataMap = new Map<string, number>();
    for (let i = 0; i < daysInPeriod; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);
      const dateStr = toLocalDateStr(currentDay);
      chartDataMap.set(dateStr, 0);
    }

    const groupedMealsMap = new Map<string, any>();

    entries.forEach((entry) => {
      const entryDateStr = toLocalDateStr(entry.date);

      const currentChartCalories = chartDataMap.get(entryDateStr) || 0;
      chartDataMap.set(entryDateStr, currentChartCalories + entry.calories);

      const mealKey = `${entryDateStr}_${entry.mealSession}`;
      if (!groupedMealsMap.has(mealKey)) {
        groupedMealsMap.set(mealKey, {
          date: entryDateStr,
          mealType: entry.mealSession,
          foods: [],
          totalCalories: 0,
        });
      }

      const mealGroup = groupedMealsMap.get(mealKey);
      mealGroup.foods.push(entry.foodName);
      mealGroup.totalCalories += entry.calories;
    });

    const allMeals = Array.from(groupedMealsMap.values()).sort((a, b) => {
      if (a.date !== b.date)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.mealType.localeCompare(b.mealType);
    });

    const totalMeals = allMeals.length;
    const totalCaloriesConsumed = allMeals.reduce(
      (sum, meal) => sum + meal.totalCalories,
      0,
    );

    const totalItems = allMeals.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedMeals = allMeals.slice((page - 1) * limit, page * limit);

    const chartData = Array.from(chartDataMap.entries()).map(
      ([date, calories]) => ({
        date,
        calories: Math.round(calories * 100) / 100,
      }),
    );

    return {
      summary: {
        totalMeals,
        totalCaloriesConsumed: Math.round(totalCaloriesConsumed * 100) / 100,
        expectedTotalCalories: Math.round(expectedTotalCalories * 100) / 100,
        daysAnalyzed: daysInPeriod,
      },
      chartData,
      table: {
        data: paginatedMeals.map((meal) => ({
          ...meal,
          totalCalories: Math.round(meal.totalCalories * 100) / 100,
        })),
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
      },
    };
  }
}

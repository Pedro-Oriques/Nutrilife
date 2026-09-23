import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FavoriteMeal,
  FavoriteMealDocument,
} from '../schemas/favorite-meal.schema';
import {
  CreateFavoriteMealDto,
  ApplyFavoriteMealDto,
} from '../dtos/favorite-meal.dto';
import { DailyTrackingService } from '../../daily-tracking/services/daily-tracking.service';

@Injectable()
export class FavoriteMealService {
  constructor(
    @InjectModel(FavoriteMeal.name)
    private favoriteMealModel: Model<FavoriteMealDocument>,
    private dailyTrackingService: DailyTrackingService, // Reutilizando sua lógica já pronta!
  ) {}

  async create(
    userId: string,
    dto: CreateFavoriteMealDto,
  ): Promise<FavoriteMeal> {
    if (!dto.foods || dto.foods.length === 0) {
      throw new BadRequestException(
        'A refeição favorita deve conter pelo menos um alimento.',
      );
    }

    const newFavorite = new this.favoriteMealModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });

    return newFavorite.save();
  }

  async findByUserAndSession(
    userId: string,
    mealSession?: string,
  ): Promise<FavoriteMeal[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (mealSession) {
      query.mealSession = mealSession;
    }
    return this.favoriteMealModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.favoriteMealModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new NotFoundException('Refeição favorita não encontrada.');
    }
  }

  // Função que pega a refeição salva e joga tudo no diário do dia selecionado
  async applyFavoriteMeal(
    userId: string,
    mealId: string,
    applyDto: ApplyFavoriteMealDto,
  ): Promise<void> {
    const favoriteMeal = await this.favoriteMealModel.findOne({
      _id: new Types.ObjectId(mealId),
      userId: new Types.ObjectId(userId),
    });

    if (!favoriteMeal) {
      throw new NotFoundException('Refeição favorita não encontrada.');
    }

    // Usamos um for...of para respeitar a assincronicidade e validar o limite de calorias a cada inserção
    for (const food of favoriteMeal.foods) {
      await this.dailyTrackingService.addEntry(userId, {
        foodId: food.foodId.toString(),
        quantity: food.quantity,
        unit: food.unit,
        mealSession: favoriteMeal.mealSession,
        date: applyDto.date,
      });
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Food, FoodDocument } from '../schemas/food.schema';
import { CreateFoodDto } from '../dtos/create-food.dto';
import { ProfileService } from 'src/profile/services/profile.services';

@Injectable()
export class FoodService {
  constructor(
    @InjectModel(Food.name) private readonly foodModel: Model<FoodDocument>,
    private readonly profileService: ProfileService,
  ) {}

  // Criar um único alimento
  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    const createdFood: FoodDocument = new this.foodModel(createFoodDto);
    return createdFood.save() as Promise<Food>;
  }

  // Criar vários alimentos
  async createMany(createFoodDtos: CreateFoodDto[]): Promise<Food[]> {
    const createdFoods: Food[] = await this.foodModel.insertMany(createFoodDtos) as Food[];
    return createdFoods;
  }

  // Listar todos os alimentos
  async findAll(): Promise<Food[]> {
    return this.foodModel.find().sort({ name: 1 }).exec() as Promise<Food[]>;
  }

  // Buscar alimentos filtrando pelo perfil do usuário
  async search(query: string, userId: string): Promise<Food[]> {
    const profile = await this.profileService.findByUserId(userId);

    const filter: Record<string, any> = { name: { $regex: query, $options: 'i' } };

    if (profile) {
      if (profile.foodRestrictions && profile.foodRestrictions.length > 0) {
        if (!profile.foodRestrictions.includes('Sem restrições')) {
          filter.foodRestrictions = { $in: [...profile.foodRestrictions, 'Sem restrições'] };
        }
      }

      if (profile.otherFoods && profile.otherFoods.length > 0) {
        filter._id = { $nin: profile.otherFoods };
      }
    }

    const foods: FoodDocument[] = await this.foodModel.find(filter).exec();

    const queryLower = query.toLowerCase();
    const sortedFoods: Food[] = foods
      .sort((a, b) => {
        const posA = a.name.toLowerCase().indexOf(queryLower);
        const posB = b.name.toLowerCase().indexOf(queryLower);
        return posA - posB;
      })
      .map(f => f.toObject() as Food);

    return sortedFoods;
  }

  // Buscar alimentos permitidos para o usuário
  async findAllowed(userId: string): Promise<Food[]> {
    const profile = await this.profileService.findByUserId(userId);
    const filter: Record<string, any> = {};

    if (profile) {
      if (profile.foodRestrictions && profile.foodRestrictions.length > 0) {
        if (!profile.foodRestrictions.includes('Sem restrições')) {
          filter.foodRestrictions = { $in: [...profile.foodRestrictions, 'Sem restrições'] };
        }
      }

      if (profile.otherFoods && profile.otherFoods.length > 0) {
        filter._id = { $nin: profile.otherFoods };
      }
    }

    const allowedFoods: FoodDocument[] = await this.foodModel.find(filter).sort({ name: 1 }).exec();
    return allowedFoods.map(f => f.toObject() as Food);
  }

  // Buscar por ID
  async findById(id: string): Promise<Food> {
    const food: FoodDocument | null = await this.foodModel.findById(id).exec();
    if (!food) throw new NotFoundException('Alimento não encontrado.');
    return food.toObject() as Food;
  }

  // Deletar alimento
  async remove(id: string): Promise<Food> {
    const deletedFood: FoodDocument | null = await this.foodModel.findByIdAndDelete(id).exec();
    if (!deletedFood) {
      throw new NotFoundException('Alimento não encontrado.');
    }
    return deletedFood.toObject() as Food;
  }
}
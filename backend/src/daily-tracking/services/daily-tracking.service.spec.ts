import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DailyTrackingService } from './daily-tracking.service';
import { DailyTracking } from '../schemas/daily-tracking.schema';
import { FoodService } from '../../food/services/food.service';
import { ProfileService } from '../../profile/services/profile.services';
import { GamificationService } from '../../gamification/gamification.service';

const mockDailyTrackingModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockFoodService = { findById: jest.fn() };
const mockProfileService = { findByUserId: jest.fn() };
const mockGamificationService = { awardPoints: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

const mockFoodId = new Types.ObjectId().toHexString();
const mockFood = {
  _id: mockFoodId,
  name: 'Frango grelhado',
  caloriesPer100g: 165,
  protein: 31,
  carbs: 0,
  fat: 3.6,
};

const mockProfile = { dailyCalorieGoal: 2000 };

describe('DailyTrackingService', () => {
  let service: DailyTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyTrackingService,
        { provide: getModelToken(DailyTracking.name), useValue: mockDailyTrackingModel },
        { provide: FoodService, useValue: mockFoodService },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<DailyTrackingService>(DailyTrackingService);
    jest.clearAllMocks();
  });

  describe('addEntry', () => {
    it('deve lançar NotFoundException quando alimento não existe', async () => {
      mockFoodService.findById.mockResolvedValue(null);

      await expect(
        service.addEntry(userId, { foodId: 'id1', quantity: 100, unit: 'g', mealSession: 'almoco' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando perfil não existe', async () => {
      mockFoodService.findById.mockResolvedValue(mockFood);
      mockProfileService.findByUserId.mockResolvedValue(null);

      await expect(
        service.addEntry(userId, { foodId: 'id1', quantity: 100, unit: 'g', mealSession: 'almoco' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve criar entrada e conceder pontos para refeição', async () => {
      mockFoodService.findById.mockResolvedValue(mockFood);
      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockDailyTrackingModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      mockGamificationService.awardPoints.mockResolvedValue(undefined);

      const saveMock = jest.fn().mockResolvedValue({ _id: 'entry1', calories: 165 });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockDailyTrackingModel);

      const module = await Test.createTestingModule({
        providers: [
          DailyTrackingService,
          { provide: getModelToken(DailyTracking.name), useValue: ModelConstructor },
          { provide: FoodService, useValue: mockFoodService },
          { provide: ProfileService, useValue: mockProfileService },
          { provide: GamificationService, useValue: mockGamificationService },
        ],
      }).compile();
      const svc = module.get<DailyTrackingService>(DailyTrackingService);

      const result = await svc.addEntry(userId, {
        foodId: mockFoodId,
        quantity: 100,
        unit: 'g',
        mealSession: 'almoco',
      });

      expect(saveMock).toHaveBeenCalled();
      expect(mockGamificationService.awardPoints).toHaveBeenCalledWith(userId, 'almoco', expect.any(String));
    });

    it('deve lançar BadRequestException para unidade inválida', async () => {
      mockFoodService.findById.mockResolvedValue(mockFood);
      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      mockDailyTrackingModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      await expect(
        service.addEntry(userId, { foodId: mockFoodId, quantity: 100, unit: 'xpto' as any, mealSession: 'almoco' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDailyTracking', () => {
    it('deve retornar tracking agrupado por sessão de refeição', async () => {
      mockProfileService.findByUserId.mockResolvedValue(mockProfile);
      const entries = [
        { mealSession: 'almoco', calories: 300, protein: 20, carbs: 30, fat: 5 },
        { mealSession: 'cafe_da_manha', calories: 200, protein: 10, carbs: 25, fat: 3 },
      ];
      mockDailyTrackingModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(entries) }),
      });

      const result = await service.getDailyTracking(userId);

      expect(result.meals).toHaveProperty('almoco');
      expect(result.meals).toHaveProperty('cafe_da_manha');
      expect(result.totalCalories).toBe(500);
      expect(result.dailyCalorieGoal).toBe(2000);
    });

    it('deve retornar calorias disponíveis corretamente', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 2000 });
      mockDailyTrackingModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([
          { mealSession: 'almoco', calories: 500, protein: 0, carbs: 0, fat: 0 },
        ]) }),
      });

      const result = await service.getDailyTracking(userId);
      expect(result.availableCalories).toBe(1500);
    });

    it('deve retornar 0 calorias disponíveis quando meta foi excedida', async () => {
      mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 500 });
      mockDailyTrackingModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([
          { mealSession: 'almoco', calories: 800, protein: 0, carbs: 0, fat: 0 },
        ]) }),
      });

      const result = await service.getDailyTracking(userId);
      expect(result.availableCalories).toBe(0);
    });
  });

  describe('removeEntry', () => {
    it('deve lançar NotFoundException quando entrada não existe', async () => {
      mockDailyTrackingModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.removeEntry(userId, 'id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException quando entrada pertence a outro usuário', async () => {
      mockDailyTrackingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => 'outro-user' } }),
      });
      await expect(service.removeEntry(userId, 'id1')).rejects.toThrow(UnauthorizedException);
    });

    it('deve remover entrada quando pertence ao usuário', async () => {
      mockDailyTrackingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => userId } }),
      });
      mockDailyTrackingModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

      await expect(service.removeEntry(userId, 'id1')).resolves.toBeUndefined();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { FavoriteMealService } from './favorite-meal.service';
import { FavoriteMeal } from '../schemas/favorite-meal.schema';
import { DailyTrackingService } from '../../daily-tracking/services/daily-tracking.service';

const mockFavoriteMealModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
};

const mockDailyTrackingService = { addEntry: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

describe('FavoriteMealService', () => {
  let service: FavoriteMealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteMealService,
        { provide: getModelToken(FavoriteMeal.name), useValue: mockFavoriteMealModel },
        { provide: DailyTrackingService, useValue: mockDailyTrackingService },
      ],
    }).compile();

    service = module.get<FavoriteMealService>(FavoriteMealService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve lançar BadRequestException quando lista de alimentos está vazia', async () => {
      await expect(
        service.create(userId, { title: 'Minha refeição', mealSession: 'almoco', foods: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar refeição favorita com alimentos', async () => {
      const dto = {
        title: 'Minha refeição',
        mealSession: 'almoco',
        foods: [{ foodId: new Types.ObjectId().toString(), name: 'Frango', quantity: 100, unit: 'g', calories: 165 }],
      };
      const saveMock = jest.fn().mockResolvedValue({ ...dto, userId });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockFavoriteMealModel);

      const module = await Test.createTestingModule({
        providers: [
          FavoriteMealService,
          { provide: getModelToken(FavoriteMeal.name), useValue: ModelConstructor },
          { provide: DailyTrackingService, useValue: mockDailyTrackingService },
        ],
      }).compile();
      const svc = module.get<FavoriteMealService>(FavoriteMealService);

      const result = await svc.create(userId, dto as any);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('findByUserAndSession', () => {
    it('deve retornar refeições favoritas do usuário', async () => {
      const meals = [{ title: 'Almoço fit', mealSession: 'almoco' }];
      mockFavoriteMealModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(meals) }) });

      const result = await service.findByUserAndSession(userId);
      expect(result).toHaveLength(1);
    });

    it('deve filtrar por sessão de refeição quando fornecida', async () => {
      mockFavoriteMealModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });

      await service.findByUserAndSession(userId, 'almoco');

      const findCall = mockFavoriteMealModel.find.mock.calls[0][0];
      expect(findCall.mealSession).toBe('almoco');
    });
  });

  describe('delete', () => {
    it('deve deletar refeição favorita', async () => {
      mockFavoriteMealModel.findOneAndDelete.mockResolvedValue({ title: 'Almoço fit' });
      await expect(service.delete(userId, new Types.ObjectId().toString())).resolves.toBeUndefined();
    });

    it('deve lançar NotFoundException quando refeição não existe ou não pertence ao usuário', async () => {
      mockFavoriteMealModel.findOneAndDelete.mockResolvedValue(null);
      await expect(service.delete(userId, new Types.ObjectId().toString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyFavoriteMeal', () => {
    it('deve lançar NotFoundException quando refeição favorita não existe', async () => {
      mockFavoriteMealModel.findOne.mockResolvedValue(null);
      await expect(
        service.applyFavoriteMeal(userId, new Types.ObjectId().toString(), { date: '2026-04-06' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve adicionar cada alimento da refeição ao diário', async () => {
      const foodId = new Types.ObjectId();
      const meal = {
        mealSession: 'almoco',
        foods: [
          { foodId, quantity: 100, unit: 'g' },
          { foodId, quantity: 50, unit: 'g' },
        ],
      };
      mockFavoriteMealModel.findOne.mockResolvedValue(meal);
      mockDailyTrackingService.addEntry.mockResolvedValue({});

      await service.applyFavoriteMeal(userId, new Types.ObjectId().toString(), { date: '2026-04-06' });

      expect(mockDailyTrackingService.addEntry).toHaveBeenCalledTimes(2);
    });
  });
});

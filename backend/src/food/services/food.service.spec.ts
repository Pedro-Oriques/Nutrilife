import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { FoodService } from './food.service';
import { Food } from '../schemas/food.schema';
import { ProfileService } from '../../profile/services/profile.services';

const mockFoodModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
};

const mockProfileService = { findByUserId: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

describe('FoodService', () => {
  let service: FoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: getModelToken(Food.name), useValue: mockFoodModel },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar e salvar um alimento', async () => {
      const dto = { name: 'Frango', caloriesPer100g: 165, foodRestrictions: ['Sem restrições'] };
      const saveMock = jest.fn().mockResolvedValue(dto);
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockFoodModel);

      const module = await Test.createTestingModule({
        providers: [
          FoodService,
          { provide: getModelToken(Food.name), useValue: ModelConstructor },
          { provide: ProfileService, useValue: mockProfileService },
        ],
      }).compile();
      const svc = module.get<FoodService>(FoodService);

      const result = await svc.create(dto as any);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('deve inserir múltiplos alimentos', async () => {
      const foods = [
        { name: 'Frango', caloriesPer100g: 165 },
        { name: 'Arroz', caloriesPer100g: 130 },
      ];
      mockFoodModel.insertMany.mockResolvedValue(foods);

      const result = await service.createMany(foods as any);
      expect(result).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os alimentos ordenados por nome', async () => {
      const foods = [{ name: 'Arroz' }, { name: 'Frango' }];
      mockFoodModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(foods) }) });

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('deve retornar alimento pelo ID', async () => {
      const food = { name: 'Frango', toObject: () => ({ name: 'Frango' }) };
      mockFoodModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(food) });

      const result = await service.findById('id1');
      expect(result.name).toBe('Frango');
    });

    it('deve lançar NotFoundException quando alimento não existe', async () => {
      mockFoodModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findById('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve deletar e retornar o alimento', async () => {
      const food = { name: 'Frango', toObject: () => ({ name: 'Frango' }) };
      mockFoodModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(food) });

      const result = await service.remove('id1');
      expect(result.name).toBe('Frango');
    });

    it('deve lançar NotFoundException quando alimento não existe', async () => {
      mockFoodModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.remove('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('deve buscar alimentos sem filtro de perfil quando perfil não existe', async () => {
      mockProfileService.findByUserId.mockResolvedValue(null);
      const foods = [
        { name: 'Frango grelhado', toObject: () => ({ name: 'Frango grelhado' }) },
      ];
      mockFoodModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(foods) });

      const result = await service.search('frango', userId);
      expect(result).toHaveLength(1);
    });

    it('deve aplicar filtro de restrições alimentares do perfil', async () => {
      mockProfileService.findByUserId.mockResolvedValue({
        foodRestrictions: ['Vegano'],
        otherFoods: [],
      });
      mockFoodModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      await service.search('arroz', userId);

      const findCall = mockFoodModel.find.mock.calls[0][0];
      expect(findCall.foodRestrictions).toBeDefined();
    });
  });

  describe('findAllowed', () => {
    it('deve retornar todos os alimentos quando perfil tem "Sem restrições"', async () => {
      mockProfileService.findByUserId.mockResolvedValue({
        foodRestrictions: ['Sem restrições'],
        otherFoods: [],
      });
      const foods = [{ name: 'Frango', toObject: () => ({ name: 'Frango' }) }];
      mockFoodModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(foods) }) });

      const result = await service.findAllowed(userId);
      expect(result).toHaveLength(1);
    });
  });
});

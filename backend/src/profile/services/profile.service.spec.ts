import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProfileService } from './profile.services';
import { Profile } from '../schemas/profile.schema';
import { WeightService } from '../../weight/services/weight.service';

const mockProfileModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockWeightService = { create: jest.fn() };

const baseDto = {
  birthDate: '1990-01-01',
  weight: 70,
  height: 175,
  gender: 'Masculino',
  physicalActivity: 'Ativo',
  goal: 'Manter saúde',
  foodRestrictions: ['Sem restrições'],
  lgpdConsent: true,
};

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getModelToken(Profile.name), useValue: mockProfileModel },
        { provide: WeightService, useValue: mockWeightService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    jest.clearAllMocks();
  });

  describe('createOrUpdate', () => {
    it('deve lançar BadRequestException para idade inválida', async () => {
      await expect(
        service.createOrUpdate('userId', { ...baseDto, birthDate: '2030-01-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException para "Sem restrições" combinado com outras opções', async () => {
      await expect(
        service.createOrUpdate('userId', {
          ...baseDto,
          foodRestrictions: ['Sem restrições', 'Vegano'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar perfil e registrar peso quando peso muda', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);
      const savedProfile = { ...baseDto, userId: new Types.ObjectId(), toObject: () => ({}) };
      mockProfileModel.findOneAndUpdate.mockResolvedValue(savedProfile);
      mockWeightService.create.mockResolvedValue({});

      const result = await service.createOrUpdate('507f1f77bcf86cd799439011', baseDto as any);

      expect(mockWeightService.create).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { weight: 70 });
      expect(result).toBeDefined();
    });

    it('não deve registrar peso quando peso não muda', async () => {
      mockProfileModel.findOne.mockResolvedValue({
        weight: 70,
        toObject: () => ({ weight: 70 }),
      });
      mockProfileModel.findOneAndUpdate.mockResolvedValue({ ...baseDto });

      await service.createOrUpdate('507f1f77bcf86cd799439011', baseDto as any);

      expect(mockWeightService.create).not.toHaveBeenCalled();
    });
  });

  describe('calculateGoals', () => {
    it('deve calcular metas para homem ativo com objetivo de manter saúde', () => {
      const goals = service.calculateGoals({
        birthDate: '1990-01-01',
        weight: 70,
        height: 175,
        gender: 'Masculino',
        physicalActivity: 'Ativo',
        goal: 'Manter saúde',
      });

      expect(goals.calories).toBeGreaterThan(1200);
      expect(goals.proteins).toBeGreaterThan(0);
      expect(goals.carbohydrates).toBeGreaterThan(0);
      expect(goals.fats).toBeGreaterThan(0);
      expect(goals.waterGoal).toBeGreaterThan(0);
    });

    it('deve reduzir calorias para objetivo de perda de peso', () => {
      const maintain = service.calculateGoals({ ...baseDto, goal: 'Manter saúde' });
      const lose = service.calculateGoals({ ...baseDto, goal: 'Perda de peso' });

      expect(lose.calories).toBeLessThan(maintain.calories);
    });

    it('deve aumentar calorias para objetivo de ganho de massa', () => {
      const maintain = service.calculateGoals({ ...baseDto, goal: 'Manter saúde' });
      const gain = service.calculateGoals({ ...baseDto, goal: 'Ganho de massa' });

      expect(gain.calories).toBeGreaterThan(maintain.calories);
    });

    it('deve calcular meta de água baseada no peso e atividade', () => {
      const sedentary = service.calculateGoals({ ...baseDto, physicalActivity: 'Sedentário' });
      const veryActive = service.calculateGoals({ ...baseDto, physicalActivity: 'Muito Ativo' });

      expect(veryActive.waterGoal).toBeGreaterThan(sedentary.waterGoal);
    });

    it('deve garantir mínimo de 1200 calorias', () => {
      const goals = service.calculateGoals({
        birthDate: '1990-01-01',
        weight: 30,
        height: 100,
        gender: 'Feminino',
        physicalActivity: 'Sedentário',
        goal: 'Perda de peso',
      });

      expect(goals.calories).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('findByUserId', () => {
    it('deve retornar perfil do usuário', async () => {
      const profile = { userId: 'id1', weight: 70 };
      mockProfileModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(profile) });

      const result = await service.findByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual(profile);
    });
  });
});

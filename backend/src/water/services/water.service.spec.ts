import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WaterService } from './water.service';
import { Water } from '../schemas/water.schema';
import { GamificationService } from '../../gamification/gamification.service';

const mockWaterModel = { findOne: jest.fn() };
const mockGamificationService = { awardPoints: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

describe('WaterService', () => {
  let service: WaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaterService,
        { provide: getModelToken(Water.name), useValue: mockWaterModel },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<WaterService>(WaterService);
    jest.clearAllMocks();
  });

  describe('addWater', () => {
    it('deve somar ao registro existente e não conceder pontos novamente', async () => {
      const saveMock = jest.fn().mockResolvedValue({ consumedMl: 700 });
      mockWaterModel.findOne.mockResolvedValue({ consumedMl: 500, save: saveMock });

      await service.addWater(userId, { amountMl: 200, date: '2026-04-06' });

      expect(saveMock).toHaveBeenCalled();
      expect(mockGamificationService.awardPoints).not.toHaveBeenCalled();
    });

    it('deve criar novo registro e conceder pontos quando não existe registro', async () => {
      mockWaterModel.findOne.mockResolvedValue(null);
      mockGamificationService.awardPoints.mockResolvedValue(undefined);

      const saveMock = jest.fn().mockResolvedValue({ consumedMl: 300 });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockWaterModel);

      const module = await Test.createTestingModule({
        providers: [
          WaterService,
          { provide: getModelToken(Water.name), useValue: ModelConstructor },
          { provide: GamificationService, useValue: mockGamificationService },
        ],
      }).compile();
      const svc = module.get<WaterService>(WaterService);

      await svc.addWater(userId, { amountMl: 300, date: '2026-04-06' });

      expect(saveMock).toHaveBeenCalled();
      expect(mockGamificationService.awardPoints).toHaveBeenCalledWith(userId, 'agua', '2026-04-06');
    });

    it('não deve lançar erro se awardPoints falhar', async () => {
      mockWaterModel.findOne.mockResolvedValue(null);
      mockGamificationService.awardPoints.mockRejectedValue(new Error('fail'));

      const saveMock = jest.fn().mockResolvedValue({ consumedMl: 300 });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockWaterModel);

      const module = await Test.createTestingModule({
        providers: [
          WaterService,
          { provide: getModelToken(Water.name), useValue: ModelConstructor },
          { provide: GamificationService, useValue: mockGamificationService },
        ],
      }).compile();
      const svc = module.get<WaterService>(WaterService);

      await expect(svc.addWater(userId, { amountMl: 300, date: '2026-04-06' })).resolves.toBeDefined();
    });

    it('deve garantir que consumedMl não seja negativo', async () => {
      const saveMock = jest.fn().mockImplementation(function () { return Promise.resolve(this); });
      const record = { consumedMl: 100, save: saveMock };
      mockWaterModel.findOne.mockResolvedValue(record);

      await service.addWater(userId, { amountMl: -500, date: '2026-04-06' });

      expect(record.consumedMl).toBe(0);
    });
  });

  describe('getWaterByDate', () => {
    it('deve retornar registro de água por data', async () => {
      const record = { consumedMl: 1500, date: '2026-04-06' };
      mockWaterModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(record) });

      const result = await service.getWaterByDate(userId, '2026-04-06');
      expect(result.consumedMl).toBe(1500);
    });

    it('deve retornar null quando não há registro', async () => {
      mockWaterModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.getWaterByDate(userId, '2026-04-06');
      expect(result).toBeNull();
    });
  });
});

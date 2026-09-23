import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WeightService } from './weight.service';
import { WeightEntry } from '../schemas/weight-entry.schema';
import { ProfileService } from '../../profile/services/profile.services';
import { GamificationService } from '../../gamification/gamification.service';

const mockWeightModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockProfileService = { updateWeight: jest.fn() };
const mockGamificationService = { awardPoints: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

describe('WeightService', () => {
  let service: WeightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeightService,
        { provide: getModelToken(WeightEntry.name), useValue: mockWeightModel },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<WeightService>(WeightService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar registro de peso, atualizar perfil e conceder pontos', async () => {
      const saveMock = jest.fn().mockResolvedValue({ weight: 75 });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockWeightModel);
      mockProfileService.updateWeight.mockResolvedValue({});
      mockGamificationService.awardPoints.mockResolvedValue(undefined);

      const module = await Test.createTestingModule({
        providers: [
          WeightService,
          { provide: getModelToken(WeightEntry.name), useValue: ModelConstructor },
          { provide: ProfileService, useValue: mockProfileService },
          { provide: GamificationService, useValue: mockGamificationService },
        ],
      }).compile();
      const svc = module.get<WeightService>(WeightService);

      const result = await svc.create(userId, { weight: 75 });

      expect(saveMock).toHaveBeenCalled();
      expect(mockProfileService.updateWeight).toHaveBeenCalledWith(userId, 75);
      expect(mockGamificationService.awardPoints).toHaveBeenCalledWith(userId, 'peso');
    });

    it('não deve lançar erro se awardPoints falhar', async () => {
      const saveMock = jest.fn().mockResolvedValue({ weight: 75 });
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      Object.assign(ModelConstructor, mockWeightModel);
      mockProfileService.updateWeight.mockResolvedValue({});
      mockGamificationService.awardPoints.mockRejectedValue(new Error('fail'));

      const module = await Test.createTestingModule({
        providers: [
          WeightService,
          { provide: getModelToken(WeightEntry.name), useValue: ModelConstructor },
          { provide: ProfileService, useValue: mockProfileService },
          { provide: GamificationService, useValue: mockGamificationService },
        ],
      }).compile();
      const svc = module.get<WeightService>(WeightService);

      await expect(svc.create(userId, { weight: 75 })).resolves.toBeDefined();
    });
  });

  describe('findAllByUser', () => {
    it('deve retornar todos os registros de peso do usuário', async () => {
      const entries = [{ weight: 75 }, { weight: 73 }];
      mockWeightModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(entries) }),
      });

      const result = await service.findAllByUser(userId);
      expect(result).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('deve deletar registro quando pertence ao usuário', async () => {
      const entryId = new Types.ObjectId().toString();
      mockWeightModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => userId } }),
      });
      mockWeightModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

      await expect(service.delete(userId, entryId)).resolves.toBeUndefined();
    });

    it('deve lançar NotFoundException quando registro não existe', async () => {
      mockWeightModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.delete(userId, 'id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando registro pertence a outro usuário', async () => {
      mockWeightModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => 'outro-user-id' } }),
      });
      await expect(service.delete(userId, 'id1')).rejects.toThrow(NotFoundException);
    });
  });
});

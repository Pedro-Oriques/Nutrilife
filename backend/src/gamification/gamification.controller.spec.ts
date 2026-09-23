import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const mockUserId = 'user-id-123';

const mockGamificationService = {
  getSummary: jest.fn(),
  getCalendar: jest.fn(),
  getRanking: jest.fn(),
  getPoints: jest.fn(),
  getScoringRules: jest.fn(),
};

const mockRequest = { user: { userId: mockUserId } };

describe('GamificationController', () => {
  let controller: GamificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: mockGamificationService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GamificationController>(GamificationController);
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('deve chamar service.getSummary com o userId do request', async () => {
      const summary = { rankingPosition: 1, totalPoints: 550, mealsCount: 3, waterLiters: 2.5 };
      mockGamificationService.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(mockRequest);

      expect(mockGamificationService.getSummary).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(summary);
    });
  });

  describe('getCalendar', () => {
    it('deve chamar service.getCalendar com o userId do request', async () => {
      const calendar = [{ date: '2026-04-06', points: 250 }];
      mockGamificationService.getCalendar.mockResolvedValue(calendar);

      const result = await controller.getCalendar(mockRequest);

      expect(mockGamificationService.getCalendar).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(calendar);
    });
  });

  describe('getRanking', () => {
    it('deve chamar service.getRanking com os parâmetros corretos', async () => {
      const rankingResult = { data: [], total: 0, page: 1, limit: 10 };
      mockGamificationService.getRanking.mockResolvedValue(rankingResult);

      const result = await controller.getRanking({ period: 'monthly', page: 1, limit: 10 });

      expect(mockGamificationService.getRanking).toHaveBeenCalledWith('monthly', 1, 10);
      expect(result).toEqual(rankingResult);
    });

    it('deve usar valores padrão page=1 e limit=10 quando não fornecidos', async () => {
      mockGamificationService.getRanking.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.getRanking({ period: 'weekly' });

      expect(mockGamificationService.getRanking).toHaveBeenCalledWith('weekly', 1, 10);
    });
  });

  describe('getPoints', () => {
    it('deve chamar service.getPoints com userId e parâmetros corretos', async () => {
      const pointsResult = { data: [], total: 0, page: 1, limit: 10 };
      mockGamificationService.getPoints.mockResolvedValue(pointsResult);

      const result = await controller.getPoints(mockRequest, { page: 2, limit: 5 });

      expect(mockGamificationService.getPoints).toHaveBeenCalledWith(mockUserId, 2, 5);
      expect(result).toEqual(pointsResult);
    });

    it('deve usar valores padrão page=1 e limit=10 quando não fornecidos', async () => {
      mockGamificationService.getPoints.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.getPoints(mockRequest, {});

      expect(mockGamificationService.getPoints).toHaveBeenCalledWith(mockUserId, 1, 10);
    });
  });

  describe('getScoringRules', () => {
    it('deve retornar as regras de pontuação do service', () => {
      const rules = [{ actionType: 'login', points: 50, label: 'Fazer login', limitType: 'daily' }];
      mockGamificationService.getScoringRules.mockReturnValue(rules);

      const result = controller.getScoringRules();

      expect(mockGamificationService.getScoringRules).toHaveBeenCalled();
      expect(result).toEqual(rules);
    });
  });
});

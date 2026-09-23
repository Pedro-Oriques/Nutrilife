import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { GamificationService } from './gamification.service';
import { PointsRecord } from './schemas/points-record.schema';
import { Water } from '../water/schemas/water.schema';

const mockUserId = new Types.ObjectId().toString();

const mockPointsRecordModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

const mockWaterModel = {
  find: jest.fn(),
};

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: getModelToken(PointsRecord.name), useValue: mockPointsRecordModel },
        { provide: getModelToken(Water.name), useValue: mockWaterModel },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    jest.clearAllMocks();
  });

  // ─── awardPoints ────────────────────────────────────────────────────────────

  describe('awardPoints', () => {
    it('deve criar um registro de pontos quando não existe registro anterior (daily)', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue(null);
      mockPointsRecordModel.create.mockResolvedValue({});

      await service.awardPoints(mockUserId, 'login');

      expect(mockPointsRecordModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockPointsRecordModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ actionType: 'login', points: 50 }),
      );
    });

    it('não deve criar registro duplicado (daily) quando já existe', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue({ actionType: 'login' });

      await service.awardPoints(mockUserId, 'login');

      expect(mockPointsRecordModel.create).not.toHaveBeenCalled();
    });

    it('deve usar limitType monthly para ação "peso"', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue(null);
      mockPointsRecordModel.create.mockResolvedValue({});

      await service.awardPoints(mockUserId, 'peso', '2026-04-06');

      const findOneCall = mockPointsRecordModel.findOne.mock.calls[0][0];
      expect(findOneCall.date).toEqual({ $regex: '^2026-04' });
      expect(mockPointsRecordModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ actionType: 'peso', points: 200 }),
      );
    });

    it('não deve criar registro mensal duplicado para "peso"', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue({ actionType: 'peso' });

      await service.awardPoints(mockUserId, 'peso');

      expect(mockPointsRecordModel.create).not.toHaveBeenCalled();
    });

    it('deve ignorar erro de duplicate key (11000) silenciosamente', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue(null);
      const dupError = new MongoServerError({ message: 'duplicate key' });
      (dupError as any).code = 11000;
      mockPointsRecordModel.create.mockRejectedValue(dupError);

      await expect(service.awardPoints(mockUserId, 'agua')).resolves.toBeUndefined();
    });

    it('deve relançar erros que não sejam duplicate key', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue(null);
      mockPointsRecordModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.awardPoints(mockUserId, 'almoco')).rejects.toThrow('DB error');
    });

    it('deve usar a data fornecida quando passada como parâmetro', async () => {
      mockPointsRecordModel.findOne.mockResolvedValue(null);
      mockPointsRecordModel.create.mockResolvedValue({});

      await service.awardPoints(mockUserId, 'jantar', '2026-01-15');

      expect(mockPointsRecordModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2026-01-15' }),
      );
    });
  });

  // ─── getSummary ─────────────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('deve retornar resumo com totalPoints, mealsCount, waterLiters e rankingPosition', async () => {
      const records = [
        { actionType: 'login', points: 50 },
        { actionType: 'cafe_da_manha', points: 200 },
        { actionType: 'almoco', points: 200 },
        { actionType: 'agua', points: 100 },
      ];
      mockPointsRecordModel.find.mockResolvedValue(records);
      mockWaterModel.find.mockResolvedValue([{ consumedMl: 2000 }, { consumedMl: 500 }]);

      const userObjId = new Types.ObjectId(mockUserId);
      mockPointsRecordModel.aggregate.mockResolvedValue([
        { _id: userObjId, total: 550 },
        { _id: new Types.ObjectId(), total: 300 },
      ]);

      const result = await service.getSummary(mockUserId);

      expect(result.totalPoints).toBe(550);
      expect(result.mealsCount).toBe(2);
      expect(result.waterLiters).toBe(2.5);
      expect(result.rankingPosition).toBe(1);
    });

    it('deve retornar rankingPosition null quando usuário não tem pontos no mês', async () => {
      mockPointsRecordModel.find.mockResolvedValue([]);
      mockWaterModel.find.mockResolvedValue([]);
      mockPointsRecordModel.aggregate.mockResolvedValue([
        { _id: new Types.ObjectId(), total: 500 },
      ]);

      const result = await service.getSummary(mockUserId);

      expect(result.rankingPosition).toBeNull();
      expect(result.totalPoints).toBe(0);
      expect(result.mealsCount).toBe(0);
      expect(result.waterLiters).toBe(0);
    });

    it('deve calcular posição correta no ranking', async () => {
      const userObjId = new Types.ObjectId(mockUserId);
      mockPointsRecordModel.find.mockResolvedValue([{ actionType: 'login', points: 50 }]);
      mockWaterModel.find.mockResolvedValue([]);
      mockPointsRecordModel.aggregate.mockResolvedValue([
        { _id: new Types.ObjectId(), total: 1000 },
        { _id: new Types.ObjectId(), total: 800 },
        { _id: userObjId, total: 50 },
      ]);

      const result = await service.getSummary(mockUserId);

      expect(result.rankingPosition).toBe(3);
    });
  });

  // ─── getCalendar ─────────────────────────────────────────────────────────────

  describe('getCalendar', () => {
    it('deve retornar array com 365 entradas', async () => {
      mockPointsRecordModel.find.mockResolvedValue([]);

      const result = await service.getCalendar(mockUserId);

      expect(result.length).toBe(365);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('points');
    });

    it('deve agregar pontos por data corretamente', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockPointsRecordModel.find.mockResolvedValue([
        { date: today, points: 50 },
        { date: today, points: 200 },
      ]);

      const result = await service.getCalendar(mockUserId);
      const todayEntry = result.find((e) => e.date === today);

      expect(todayEntry?.points).toBe(250);
    });

    it('deve retornar 0 pontos para datas sem registros', async () => {
      mockPointsRecordModel.find.mockResolvedValue([]);

      const result = await service.getCalendar(mockUserId);

      expect(result.every((e) => e.points === 0)).toBe(true);
    });
  });

  // ─── getRanking ──────────────────────────────────────────────────────────────

  describe('getRanking', () => {
    const mockRows = [
      { _id: new Types.ObjectId(), totalPoints: 1000, fullName: 'Alice' },
      { _id: new Types.ObjectId(), totalPoints: 800, fullName: 'Bob' },
    ];

    beforeEach(() => {
      mockPointsRecordModel.aggregate
        .mockResolvedValueOnce([{ total: 2 }]) // count
        .mockResolvedValueOnce(mockRows);       // data
    });

    it('deve retornar dados paginados com posição correta', async () => {
      const result = await service.getRanking('monthly', 1, 10);

      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data[0].position).toBe(1);
      expect(result.data[1].position).toBe(2);
      expect(result.data[0].fullName).toBe('Alice');
    });

    it('deve calcular posição correta na segunda página', async () => {
      mockPointsRecordModel.aggregate
        .mockReset()
        .mockResolvedValueOnce([{ total: 20 }])
        .mockResolvedValueOnce(mockRows);

      const result = await service.getRanking('all-time', 2, 10);

      expect(result.data[0].position).toBe(11);
      expect(result.data[1].position).toBe(12);
    });

    it('deve retornar total 0 quando não há registros', async () => {
      mockPointsRecordModel.aggregate
        .mockReset()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getRanking('weekly', 1, 10);

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── getPoints ───────────────────────────────────────────────────────────────

  describe('getPoints', () => {
    it('deve retornar histórico paginado de pontos', async () => {
      const fakeId = new Types.ObjectId();
      mockPointsRecordModel.countDocuments.mockResolvedValue(5);
      mockPointsRecordModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: fakeId, actionType: 'login', points: 50, date: '2026-04-06' },
        ]),
      });

      const result = await service.getPoints(mockUserId, 1, 10);

      expect(result.total).toBe(5);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].actionType).toBe('login');
      expect(result.data[0].points).toBe(50);
      expect(result.data[0]._id).toBe(fakeId.toString());
    });

    it('deve retornar lista vazia quando não há registros', async () => {
      mockPointsRecordModel.countDocuments.mockResolvedValue(0);
      mockPointsRecordModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getPoints(mockUserId, 1, 10);

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── getScoringRules ─────────────────────────────────────────────────────────

  describe('getScoringRules', () => {
    it('deve retornar 7 regras de pontuação', () => {
      const rules = service.getScoringRules();
      expect(rules).toHaveLength(7);
    });

    it('deve conter todas as ações esperadas', () => {
      const rules = service.getScoringRules();
      const actionTypes = rules.map((r) => r.actionType);
      expect(actionTypes).toEqual(
        expect.arrayContaining(['login', 'agua', 'peso', 'cafe_da_manha', 'almoco', 'jantar', 'lanche']),
      );
    });

    it('deve ter pontuações corretas', () => {
      const rules = service.getScoringRules();
      const login = rules.find((r) => r.actionType === 'login');
      const peso = rules.find((r) => r.actionType === 'peso');

      expect(login?.points).toBe(50);
      expect(peso?.points).toBe(200);
      expect(peso?.limitType).toBe('monthly');
    });
  });
});

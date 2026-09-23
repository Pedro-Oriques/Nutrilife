import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReportService } from './report.service';
import { DailyTracking } from '../../daily-tracking/schemas/daily-tracking.schema';
import { ProfileService } from '../../profile/services/profile.services';

const mockDailyTrackingModel = { find: jest.fn() };
const mockProfileService = { findByUserId: jest.fn() };

const userId = '507f1f77bcf86cd799439011';

const baseQuery = { startDate: '2026-04-01', endDate: '2026-04-07', page: 1, limit: 10 };

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getModelToken(DailyTracking.name), useValue: mockDailyTrackingModel },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    jest.clearAllMocks();
  });

  it('deve lançar BadRequestException quando data final é anterior à inicial', async () => {
    mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 2000 });

    await expect(
      service.generateReport(userId, { startDate: '2026-04-07', endDate: '2026-04-01', page: 1, limit: 10 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException quando perfil não existe', async () => {
    mockProfileService.findByUserId.mockResolvedValue(null);

    await expect(service.generateReport(userId, baseQuery)).rejects.toThrow(NotFoundException);
  });

  it('deve retornar relatório com summary, chartData e table', async () => {
    mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 2000 });
    mockDailyTrackingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          date: new Date('2026-04-03'),
          mealSession: 'almoco',
          foodName: 'Frango',
          calories: 300,
        },
        {
          date: new Date('2026-04-03'),
          mealSession: 'almoco',
          foodName: 'Arroz',
          calories: 200,
        },
      ]),
    });

    const result = await service.generateReport(userId, baseQuery);

    expect(result.summary.daysAnalyzed).toBe(7);
    expect(result.summary.totalCaloriesConsumed).toBe(500);
    expect(result.summary.expectedTotalCalories).toBe(14000);
    expect(result.chartData).toHaveLength(7);
    expect(result.table.data).toHaveLength(1); // 1 grupo de refeição
  });

  it('deve retornar chartData com 0 calorias para dias sem registros', async () => {
    mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 2000 });
    mockDailyTrackingModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.generateReport(userId, baseQuery);

    expect(result.chartData.every((d) => d.calories === 0)).toBe(true);
    expect(result.summary.totalMeals).toBe(0);
  });

  it('deve paginar os resultados corretamente', async () => {
    mockProfileService.findByUserId.mockResolvedValue({ dailyCalorieGoal: 2000 });
    const entries = Array.from({ length: 15 }, (_, i) => ({
      date: new Date(`2026-04-0${(i % 7) + 1}`),
      mealSession: 'almoco',
      foodName: `Alimento ${i}`,
      calories: 100,
    }));
    mockDailyTrackingModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(entries) });

    const result = await service.generateReport(userId, { ...baseQuery, page: 1, limit: 5 });

    expect(result.table.data).toHaveLength(5);
    expect(result.table.pagination.totalPages).toBeGreaterThan(1);
  });
});

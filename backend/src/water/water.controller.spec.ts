import { Test, TestingModule } from '@nestjs/testing';
import { WaterController } from './water.controller';
import { WaterService } from './services/water.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockWaterService = {
  addWater: jest.fn(),
  getWaterByDate: jest.fn(),
};

const mockReq = { user: { userId: 'user-id-123' } };

describe('WaterController', () => {
  let controller: WaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterController],
      providers: [{ provide: WaterService, useValue: mockWaterService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WaterController>(WaterController);
    jest.clearAllMocks();
  });

  it('deve adicionar consumo de água', async () => {
    const record = { consumedMl: 300, date: '2026-04-06' };
    mockWaterService.addWater.mockResolvedValue(record);

    const result = await controller.addWater(mockReq, { amountMl: 300, date: '2026-04-06' });

    expect(mockWaterService.addWater).toHaveBeenCalledWith('user-id-123', { amountMl: 300, date: '2026-04-06' });
    expect(result.consumedMl).toBe(300);
  });

  it('deve retornar consumo de água por data', async () => {
    const record = { consumedMl: 1500, date: '2026-04-06' };
    mockWaterService.getWaterByDate.mockResolvedValue(record);

    const result = await controller.getWaterByDate(mockReq, '2026-04-06');

    expect(mockWaterService.getWaterByDate).toHaveBeenCalledWith('user-id-123', '2026-04-06');
    expect(result.consumedMl).toBe(1500);
  });

  it('deve retornar null quando não há registro para a data', async () => {
    mockWaterService.getWaterByDate.mockResolvedValue(null);

    const result = await controller.getWaterByDate(mockReq, '2026-01-01');
    expect(result).toBeNull();
  });
});

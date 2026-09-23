import { Test, TestingModule } from '@nestjs/testing';
import { WeightController } from './weight.controller';
import { WeightService } from '../services/weight.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const mockWeightService = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  delete: jest.fn(),
};

const mockReq = { user: { userId: 'user-id-123' } };

describe('WeightController', () => {
  let controller: WeightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeightController],
      providers: [{ provide: WeightService, useValue: mockWeightService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WeightController>(WeightController);
    jest.clearAllMocks();
  });

  it('deve criar registro de peso', async () => {
    const entry = { weight: 75 };
    mockWeightService.create.mockResolvedValue(entry);

    const result = await controller.create(mockReq, { weight: 75 });

    expect(mockWeightService.create).toHaveBeenCalledWith('user-id-123', { weight: 75 });
    expect(result.weight).toBe(75);
  });

  it('deve retornar todos os registros de peso do usuário', async () => {
    const entries = [{ weight: 75 }, { weight: 73 }];
    mockWeightService.findAllByUser.mockResolvedValue(entries);

    const result = await controller.findAll(mockReq);

    expect(mockWeightService.findAllByUser).toHaveBeenCalledWith('user-id-123');
    expect(result).toHaveLength(2);
  });

  it('deve deletar registro de peso', async () => {
    mockWeightService.delete.mockResolvedValue(undefined);

    const result = await controller.delete(mockReq, 'entry-id');

    expect(mockWeightService.delete).toHaveBeenCalledWith('user-id-123', 'entry-id');
  });
});

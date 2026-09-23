import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from '../services/profile.services';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const mockProfileService = {
  createOrUpdate: jest.fn(),
  findByUserId: jest.fn(),
};

const mockReq = { user: { userId: 'user-id-123' } };

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    jest.clearAllMocks();
  });

  it('deve criar ou atualizar perfil', async () => {
    const profile = { weight: 70, height: 175 };
    mockProfileService.createOrUpdate.mockResolvedValue(profile);

    const result = await controller.createOrUpdate(mockReq, profile as any);

    expect(mockProfileService.createOrUpdate).toHaveBeenCalledWith('user-id-123', profile);
    expect(result).toEqual(profile);
  });

  it('deve atualizar perfil via PUT', async () => {
    const profile = { weight: 72 };
    mockProfileService.createOrUpdate.mockResolvedValue(profile);

    const result = await controller.update(mockReq, profile as any);
    expect(result).toEqual(profile);
  });

  it('deve retornar perfil do usuário logado', async () => {
    const profile = { weight: 70 };
    mockProfileService.findByUserId.mockResolvedValue(profile);

    const result = await controller.getProfile(mockReq);

    expect(mockProfileService.findByUserId).toHaveBeenCalledWith('user-id-123');
    expect(result).toEqual(profile);
  });
});

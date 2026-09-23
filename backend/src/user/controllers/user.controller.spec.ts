import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const mockUserService = { findById: jest.fn(), updateUser: jest.fn() };
const mockReq = { user: { userId: 'user-id-123' } };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('deve retornar perfil do usuário logado', async () => {
    mockUserService.findById.mockResolvedValue({ fullName: 'Test' });

    const result = await controller.getProfile(mockReq);

    expect(mockUserService.findById).toHaveBeenCalledWith('user-id-123');
    expect(result.fullName).toBe('Test');
  });

  it('deve atualizar perfil do usuário logado', async () => {
    mockUserService.updateUser.mockResolvedValue({ fullName: 'Novo' });

    const result = await controller.updateProfile(mockReq, { fullName: 'Novo' });

    expect(mockUserService.updateUser).toHaveBeenCalledWith('user-id-123', { fullName: 'Novo' });
    expect(result.fullName).toBe('Novo');
  });
});

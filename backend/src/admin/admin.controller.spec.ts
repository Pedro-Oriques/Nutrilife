import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { UserService } from '../user/services/user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockUserService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
    jest.clearAllMocks();
  });

  it('deve listar todos os usuários', async () => {
    const users = [{ fullName: 'A' }, { fullName: 'B' }];
    mockUserService.findAll.mockResolvedValue(users);

    const result = await controller.getAllUsers();
    expect(result).toHaveLength(2);
  });

  it('deve retornar usuário por ID', async () => {
    mockUserService.findById.mockResolvedValue({ fullName: 'Test' });

    const result = await controller.getUserById('id1');
    expect(result.fullName).toBe('Test');
  });

  it('deve atualizar usuário', async () => {
    mockUserService.updateUser.mockResolvedValue({ fullName: 'Novo' });

    const result = await controller.updateUser('id1', { fullName: 'Novo' });
    expect(result.fullName).toBe('Novo');
  });

  it('deve deletar usuário sem retornar conteúdo', async () => {
    mockUserService.deleteUser.mockResolvedValue(true);

    const result = await controller.deleteUser('id1');
    expect(result).toBeUndefined();
  });
});

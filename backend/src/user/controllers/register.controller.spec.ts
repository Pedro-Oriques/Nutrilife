import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterController } from './register.controller';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const mockUserService = {
  createUser: jest.fn(),
  deleteUser: jest.fn(),
  findAll: jest.fn(),
};

describe('RegisterController', () => {
  let controller: RegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RegisterController>(RegisterController);
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('deve registrar usuário com sucesso', async () => {
      mockUserService.createUser.mockResolvedValue({ _id: 'id1', fullName: 'Test' });

      const result = await controller.registerUser({
        fullName: 'Test',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: '123456',
      });

      expect(result.message).toBe('Cadastro realizado com sucesso.');
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      mockUserService.createUser.mockRejectedValue({ status: 409 });

      await expect(
        controller.registerUser({
          fullName: 'Test',
          email: 'test@test.com',
          password: '123456',
          confirmPassword: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário com sucesso', async () => {
      mockUserService.deleteUser.mockResolvedValue(true);
      const result = await controller.deleteUser('id1');
      expect(result).toBeUndefined();
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockUserService.deleteUser.mockResolvedValue(false);
      await expect(controller.deleteUser('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('deve retornar lista de usuários', async () => {
      mockUserService.findAll.mockResolvedValue([{ fullName: 'A' }]);
      const result = await controller.getAllUsers();
      expect(result).toHaveLength(1);
    });
  });
});

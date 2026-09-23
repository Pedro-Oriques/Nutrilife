import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token quando credenciais são válidas', async () => {
      const user = { _id: 'id1', email: 'user@test.com' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue({ token: 'jwt-token', payload: {} });

      const result = await controller.login({ email: 'user@test.com', password: 'senha' });

      expect(result.token).toBe('jwt-token');
    });

    it('deve lançar UnauthorizedException quando credenciais são inválidas', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'user@test.com', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

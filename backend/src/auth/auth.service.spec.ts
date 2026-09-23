import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/services/user.service';
import { GamificationService } from '../gamification/gamification.service';

const mockUserService = { findByEmail: jest.fn() };
const mockJwtService = { sign: jest.fn() };
const mockGamificationService = { awardPoints: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('deve retornar o usuário sem senha quando credenciais são válidas', async () => {
      const hashed = await bcrypt.hash('senha123', 10);
      mockUserService.findByEmail.mockResolvedValue({
        _id: 'id1',
        email: 'user@test.com',
        password: hashed,
        fullName: 'Test',
      });

      const result = await service.validateUser('user@test.com', 'senha123');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('user@test.com');
    });

    it('deve retornar null quando usuário não existe', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('nao@existe.com', 'senha');
      expect(result).toBeNull();
    });

    it('deve retornar null quando senha está errada', async () => {
      const hashed = await bcrypt.hash('correta', 10);
      mockUserService.findByEmail.mockResolvedValue({
        _id: 'id1',
        email: 'user@test.com',
        password: hashed,
      });

      const result = await service.validateUser('user@test.com', 'errada');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve retornar token e dados do usuário', async () => {
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockGamificationService.awardPoints.mockResolvedValue(undefined);

      const user = { _id: 'id1', email: 'user@test.com', fullName: 'Test', role: 'user' };
      const result = await service.login(user);

      expect(result.token).toBe('jwt-token');
      expect(result.payload.username).toBe('Test');
      expect(mockGamificationService.awardPoints).toHaveBeenCalledWith('id1', 'login');
    });

    it('não deve lançar erro se awardPoints falhar', async () => {
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockGamificationService.awardPoints.mockRejectedValue(new Error('fail'));

      const user = { _id: 'id1', email: 'user@test.com', fullName: 'Test', role: 'user' };
      await expect(service.login(user)).resolves.toBeDefined();
    });
  });
});

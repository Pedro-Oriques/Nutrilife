import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { RecoveryService } from './recovery.service';
import { User } from '../schemas/user.squema';

const mockUserModel = { findOne: jest.fn() };

describe('RecoveryService', () => {
  let service: RecoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<RecoveryService>(RecoveryService);
    jest.clearAllMocks();
  });

  describe('findQuestionByEmail', () => {
    it('deve retornar a pergunta secreta quando email existe', async () => {
      mockUserModel.findOne.mockResolvedValue({
        email: 'test@test.com',
        secretQuestion: 'Nome do pet?',
      });

      const result = await service.findQuestionByEmail('test@test.com');
      expect(result.secretQuestion).toBe('Nome do pet?');
    });

    it('deve lançar NotFoundException quando email não existe', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      await expect(service.findQuestionByEmail('nao@existe.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('deve lançar BadRequestException quando senhas não coincidem', async () => {
      await expect(
        service.updatePassword({
          email: 'test@test.com',
          secretAnswer: 'resposta',
          newPassword: 'nova123',
          confirmNewPassword: 'diferente',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException quando email não existe', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.updatePassword({
          email: 'nao@existe.com',
          secretAnswer: 'resposta',
          newPassword: 'nova123',
          confirmNewPassword: 'nova123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException quando resposta secreta está errada', async () => {
      const hashed = await bcrypt.hash('correta', 10);
      mockUserModel.findOne.mockResolvedValue({
        email: 'test@test.com',
        secretAnswer: hashed,
        save: jest.fn(),
      });

      await expect(
        service.updatePassword({
          email: 'test@test.com',
          secretAnswer: 'errada',
          newPassword: 'nova123',
          confirmNewPassword: 'nova123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve alterar a senha com sucesso quando resposta está correta', async () => {
      const hashed = await bcrypt.hash('correta', 10);
      const saveMock = jest.fn().mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue({
        email: 'test@test.com',
        secretAnswer: hashed,
        password: hashed,
        save: saveMock,
      });

      const result = await service.updatePassword({
        email: 'test@test.com',
        secretAnswer: 'correta',
        newPassword: 'nova123',
        confirmNewPassword: 'nova123',
      });

      expect(result.message).toBe('Senha alterada com sucesso.');
      expect(saveMock).toHaveBeenCalled();
    });

    it('deve normalizar a resposta secreta (trim + lowercase)', async () => {
      const hashed = await bcrypt.hash('correta', 10);
      const saveMock = jest.fn().mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue({
        email: 'test@test.com',
        secretAnswer: hashed,
        save: saveMock,
      });

      const result = await service.updatePassword({
        email: 'test@test.com',
        secretAnswer: '  CORRETA  ',
        newPassword: 'nova123',
        confirmNewPassword: 'nova123',
      });

      expect(result.message).toBe('Senha alterada com sucesso.');
    });
  });
});

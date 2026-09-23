import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from '../services/recovery.service';

const mockRecoveryService = {
  findQuestionByEmail: jest.fn(),
  updatePassword: jest.fn(),
};

describe('RecoveryController', () => {
  let controller: RecoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecoveryController],
      providers: [{ provide: RecoveryService, useValue: mockRecoveryService }],
    }).compile();

    controller = module.get<RecoveryController>(RecoveryController);
    jest.clearAllMocks();
  });

  it('deve retornar pergunta secreta pelo email', async () => {
    mockRecoveryService.findQuestionByEmail.mockResolvedValue({ secretQuestion: 'Nome do pet?' });

    const result = await controller.checkEmailForRecovery({ email: 'test@test.com' });

    expect(mockRecoveryService.findQuestionByEmail).toHaveBeenCalledWith('test@test.com');
    expect(result.secretQuestion).toBe('Nome do pet?');
  });

  it('deve redefinir senha com sucesso', async () => {
    mockRecoveryService.updatePassword.mockResolvedValue({ message: 'Senha alterada com sucesso.' });

    const result = await controller.resetPassword({
      email: 'test@test.com',
      secretAnswer: 'resposta',
      newPassword: 'nova123',
      confirmNewPassword: 'nova123',
    });

    expect(result.message).toBe('Senha alterada com sucesso.');
  });
});

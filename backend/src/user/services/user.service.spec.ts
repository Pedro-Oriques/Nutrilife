import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from '../schemas/user.squema';

const mockUserModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  exists: jest.fn(),
  deleteOne: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve retornar usuário sem campos sensíveis', async () => {
      mockUserModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'id1',
          fullName: 'Test',
          email: 'test@test.com',
          password: 'hash',
          secretAnswer: 'hash2',
        }),
      });

      const result = await service.findById('id1');

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('secretAnswer');
      expect(result.fullName).toBe('Test');
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockUserModel.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      await expect(service.findById('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário pelo email', async () => {
      const user = { email: 'test@test.com', fullName: 'Test' };
      mockUserModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(user) });

      const result = await service.findByEmail('test@test.com');
      expect(result.email).toBe('test@test.com');
    });

    it('deve retornar null quando email não existe', async () => {
      mockUserModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const result = await service.findByEmail('nao@existe.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('deve lançar 409 quando email já existe', async () => {
      mockUserModel.exists.mockResolvedValue(true);

      await expect(
        service.createUser({
          fullName: 'Test',
          email: 'test@test.com',
          password: '123456',
          confirmPassword: '123456',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('deve lançar 400 quando senhas não coincidem', async () => {
      mockUserModel.exists.mockResolvedValue(false);

      await expect(
        service.createUser({
          fullName: 'Test',
          email: 'test@test.com',
          password: '123456',
          confirmPassword: 'diferente',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('deve criar usuário com senha hasheada', async () => {
      mockUserModel.exists.mockResolvedValue(false);
      const saveMock = jest.fn().mockResolvedValue({
        toObject: () => ({
          _id: 'id1',
          fullName: 'Test',
          email: 'test@test.com',
          password: 'hashed',
        }),
      });
      (mockUserModel as any).prototype = { save: saveMock };

      // Simula o construtor do model
      const ModelConstructor = jest.fn().mockImplementation(() => ({ save: saveMock }));
      const module = await Test.createTestingModule({
        providers: [
          UserService,
          { provide: getModelToken(User.name), useValue: ModelConstructor },
        ],
      }).compile();
      const svc = module.get<UserService>(UserService);
      (ModelConstructor as any).exists = jest.fn().mockResolvedValue(false);

      saveMock.mockResolvedValue({
        toObject: () => ({ _id: 'id1', fullName: 'Test', email: 'test@test.com' }),
      });

      const result = await svc.createUser({
        fullName: 'Test',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: '123456',
      });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('updateUser', () => {
    it('deve lançar 400 quando nenhum dado é fornecido', async () => {
      await expect(service.updateUser('id1', {})).rejects.toThrow(HttpException);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      await expect(service.updateUser('id1', { fullName: 'Novo' })).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar usuário e retornar sem campos sensíveis', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'id1' });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'id1',
          fullName: 'Novo',
          email: 'test@test.com',
          password: 'hash',
          secretAnswer: 'hash2',
        }),
      });

      const result = await service.updateUser('id1', { fullName: 'Novo' });

      expect(result).not.toHaveProperty('password');
      expect(result.fullName).toBe('Novo');
    });
  });

  describe('deleteUser', () => {
    it('deve retornar true quando usuário é deletado', async () => {
      mockUserModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await service.deleteUser('id1');
      expect(result).toBe(true);
    });

    it('deve retornar false quando usuário não existe', async () => {
      mockUserModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await service.deleteUser('id-inexistente');
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários sem campos sensíveis', async () => {
      mockUserModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'id1', fullName: 'A', email: 'a@a.com', password: 'h', secretAnswer: 'h' },
          { _id: 'id2', fullName: 'B', email: 'b@b.com', password: 'h', secretAnswer: 'h' },
        ]),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      result.forEach((u) => {
        expect(u).not.toHaveProperty('password');
        expect(u).not.toHaveProperty('secretAnswer');
      });
    });
  });
});

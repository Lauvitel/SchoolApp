import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'uuid-1',
    email: 'john@test.com',
    pseudo: 'john',
    password: 'hashed_password',
    role: 'STUDENT' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    const input = {
      email: 'john@test.com',
      pseudo: 'john',
      password: 'password123',
      role: 'STUDENT' as const,
    };

    it('should create a user with hashed password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(input);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: input.email,
          pseudo: input.pseudo,
          password: 'hashed_password',
          role: input.role,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw if email already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(service.create(input)).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should throw if pseudo already in use', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.create(input)).rejects.toThrow(
        'Pseudo already in use',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@test.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('unknown@test.com');
      expect(result).toBeNull();
    });
  });

  describe('updateMe', () => {
    it('should update user data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        pseudo: 'newpseudo',
      });

      const result = await service.updateMe('uuid-1', { pseudo: 'newpseudo' });
      expect(result.pseudo).toBe('newpseudo');
    });

    it('should hash password when updating', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      mockPrisma.user.update.mockResolvedValue(mockUser);

      await service.updateMe('uuid-1', { password: 'newpassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { password: 'new_hashed' },
      });
    });

    it('should throw if email taken by another user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 'other-id',
      });

      await expect(
        service.updateMe('uuid-1', { email: 'john@test.com' }),
      ).rejects.toThrow('Email already in use');
    });

    it('should throw if pseudo taken by another user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        id: 'other-id',
      });

      await expect(
        service.updateMe('uuid-1', { pseudo: 'john' }),
      ).rejects.toThrow('Pseudo already in use');
    });
  });

  describe('deleteMe', () => {
    it('should delete the user', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser);
      const result = await service.deleteMe('uuid-1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

const mockUsersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  updateMe: jest.fn(),
  deleteMe: jest.fn(),
};

const mockUser = {
  id: 'uuid-1',
  email: 'john@test.com',
  pseudo: 'john',
  password: 'hashed',
  role: 'STUDENT' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    jest.clearAllMocks();
  });

  describe('users', () => {
    it('should return all users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      const result = await resolver.users();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('user', () => {
    it('should return a user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      const result = await resolver.user('uuid-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('me', () => {
    it('should return current user', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      const result = await resolver.me({ userId: 'uuid-1' });
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('updateMe', () => {
    it('should update current user', async () => {
      const updated = { ...mockUser, pseudo: 'newpseudo' };
      mockUsersService.updateMe.mockResolvedValue(updated);
      const result = await resolver.updateMe(
        { userId: 'uuid-1' },
        { pseudo: 'newpseudo' },
      );
      expect(result.pseudo).toBe('newpseudo');
      expect(mockUsersService.updateMe).toHaveBeenCalledWith('uuid-1', {
        pseudo: 'newpseudo',
      });
    });
  });

  describe('deleteMe', () => {
    it('should delete current user', async () => {
      mockUsersService.deleteMe.mockResolvedValue(mockUser);
      const result = await resolver.deleteMe({ userId: 'uuid-1' });
      expect(result).toEqual(mockUser);
      expect(mockUsersService.deleteMe).toHaveBeenCalledWith('uuid-1');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const mockUser = {
  id: 'uuid-1',
  email: 'john@test.com',
  pseudo: 'john',
  role: 'STUDENT' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return token + user', async () => {
      const response = { accessToken: 'jwt-token', user: mockUser };
      mockAuthService.register.mockResolvedValue(response);

      const input = {
        email: 'john@test.com',
        pseudo: 'john',
        password: 'password123',
        role: 'STUDENT' as const,
      };
      const result = await resolver.register(input);

      expect(result).toEqual(response);
      expect(mockAuthService.register).toHaveBeenCalledWith(input);
    });
  });

  describe('login', () => {
    it('should login and return token + user', async () => {
      const response = { accessToken: 'jwt-token', user: mockUser };
      mockAuthService.login.mockResolvedValue(response);

      const input = { email: 'john@test.com', password: 'password123' };
      const result = await resolver.login(input);

      expect(result).toEqual(response);
      expect(mockAuthService.login).toHaveBeenCalledWith(input);
    });
  });
});

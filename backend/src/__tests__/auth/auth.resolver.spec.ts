import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from '../../auth/auth.resolver';
import { AuthService } from '../../auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let service: AuthService;

  const mockService = {
    signup: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    service = module.get<AuthService>(AuthService);
  });

  it('signup should return success message', async () => {
    mockService.signup.mockResolvedValue({ message: 'User registered successfully' });
    const result = await resolver.signup('user', 'pass');
    expect(result).toBe('User registered successfully');
  });

  it('login should return tokens', async () => {
    mockService.validateUser.mockResolvedValue({ username: 'user', _id: 'id', role: 'REQUESTER' });
    mockService.login.mockResolvedValue({ access_token: 'token1', refresh_token: 'token2' });

    const result = await resolver.login('user', 'pass');
    const tokens = JSON.parse(result);
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
  });

  it('login should throw UnauthorizedException if user invalid', async () => {
    mockService.validateUser.mockResolvedValue(null);
    await expect(resolver.login('user', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshToken should return new tokens', async () => {
    mockService.refreshToken.mockResolvedValue({ access_token: 'new1', refresh_token: 'new2' });
    const result = await resolver.refreshToken('old-token');
    const tokens = JSON.parse(result);
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
  });
});

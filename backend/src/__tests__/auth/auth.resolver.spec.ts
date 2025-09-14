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

    jest.clearAllMocks();
  });

  it('signup should return success message', async () => {
    mockService.signup.mockResolvedValue(undefined); // service doesn't return anything
    const result = await resolver.signup('user', 'pass');
    expect(result).toEqual({ message: 'User registered successfully' });
    expect(mockService.signup).toHaveBeenCalledWith('user', 'pass', 'REQUESTER');
  });

  it('login should return tokens', async () => {
    mockService.validateUser.mockResolvedValue({ username: 'user', _id: 'id', role: 'REQUESTER' });
    mockService.login.mockResolvedValue({ access_token: 'token1', refresh_token: 'token2' });

    const result = await resolver.login('user', 'pass');
    expect(result).toEqual({ access_token: 'token1', refresh_token: 'token2' });
    expect(mockService.validateUser).toHaveBeenCalledWith('user', 'pass');
  });

  it('login should throw UnauthorizedException if user invalid', async () => {
    mockService.validateUser.mockResolvedValue(null);

    await expect(resolver.login('user', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshToken should return new tokens', async () => {
    mockService.refreshToken.mockResolvedValue({ access_token: 'new1', refresh_token: 'new2' });

    const result = await resolver.refreshToken('old-token');
    expect(result).toEqual({ access_token: 'new1', refresh_token: 'new2' });
    expect(mockService.refreshToken).toHaveBeenCalledWith('old-token');
  });

  it('secureData should return protected string', () => {
    const result = resolver.secureData();
    expect(result).toBe('This data is protected and requires JWT!');
  });
});

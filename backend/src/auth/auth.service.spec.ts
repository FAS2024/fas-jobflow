import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../schemas/user.schema';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user-id-1',
    username: 'testuser',
    password: bcrypt.hashSync('password123', 12),
    role: UserRole.REQUESTER,
    currentRefreshToken: null,
    toObject: function () { return { ...this }; },
  };

  class UserModelMock {
    static findOne = jest.fn();
    static findById = jest.fn();
    static findByIdAndUpdate = jest.fn();

    save: jest.Mock;

    constructor(private data: any) {
      this.save = jest.fn().mockResolvedValue({ ...mockUser, ...this.data });
    }
  }

  const jwtServiceMock = {
    sign: jest.fn((payload) => `${payload.username}-token`),
    verify: jest.fn((token) => ({ username: 'testuser', sub: 'user-id-1' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: UserModelMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('signup should create a new user', async () => {
    (UserModelMock.findOne as jest.Mock).mockResolvedValue(null);
    const result = await service.signup('testuser', 'password123');
    expect(result.message).toBe('User registered successfully');
  });

  it('signup should throw ForbiddenException if username exists', async () => {
    (UserModelMock.findOne as jest.Mock).mockResolvedValue(mockUser);
    await expect(service.signup('testuser', 'password123')).rejects.toThrow(ForbiddenException);
  });

  it('validateUser should return user for correct credentials', async () => {
    (UserModelMock.findOne as jest.Mock).mockResolvedValue(mockUser);
    const user = await service.validateUser('testuser', 'password123');
    expect(user!.username).toBe('testuser');
  });

  it('validateUser should return null for invalid password', async () => {
    (UserModelMock.findOne as jest.Mock).mockResolvedValue(mockUser);
    const user = await service.validateUser('testuser', 'wrongpass');
    expect(user).toBeNull();
  });

  it('validateUser should return null if user not found', async () => {
    (UserModelMock.findOne as jest.Mock).mockResolvedValue(null);
    const user = await service.validateUser('unknown', 'password123');
    expect(user).toBeNull();
  });

  it('login should return access and refresh tokens', async () => {
    (UserModelMock.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockUser, currentRefreshToken: 'hashed-token' });
    const tokens = await service.login(mockUser);
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
  });

  it('refreshToken should return new tokens for valid token', async () => {
    const hashedRefreshToken = await bcrypt.hash('testuser-token', 12);
    (UserModelMock.findById as jest.Mock).mockResolvedValue({ ...mockUser, currentRefreshToken: hashedRefreshToken });
    (UserModelMock.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockUser, currentRefreshToken: hashedRefreshToken });

    const newTokens = await service.refreshToken('testuser-token');
    expect(newTokens.access_token).toBeDefined();
    expect(newTokens.refresh_token).toBeDefined();
  });

  it('refreshToken should throw UnauthorizedException for invalid token', async () => {
    (UserModelMock.findById as jest.Mock).mockResolvedValue({ ...mockUser, currentRefreshToken: 'some-hash' });
    await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshToken should throw UnauthorizedException if user not found', async () => {
    (UserModelMock.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.refreshToken('any-token')).rejects.toThrow(UnauthorizedException);
  });
});

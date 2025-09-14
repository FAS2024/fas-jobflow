import { Injectable, UnauthorizedException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(username: string, password: string, role: UserRole = UserRole.REQUESTER) {
    const existing = await this.userModel.findOne({ username });
    if (existing) throw new ForbiddenException('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({ username, password: hashedPassword, role });
    try {
      await user.save();
      return { message: 'User registered successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    const { password: _, currentRefreshToken, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id, role: user.role };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 12);
    await this.userModel.findByIdAndUpdate(user._id, { currentRefreshToken: hashedRefreshToken });

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded: any = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.userModel.findById(decoded.sub);
      if (!user || !user.currentRefreshToken) throw new UnauthorizedException();

      const tokenMatches = await bcrypt.compare(refreshToken, user.currentRefreshToken);
      if (!tokenMatches) throw new UnauthorizedException();

      const payload = { username: user.username, sub: user._id, role: user.role, refreshedAt: Date.now() };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      });

      const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 12);
      await this.userModel.findByIdAndUpdate(user._id, { currentRefreshToken: newHashedRefreshToken });

      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

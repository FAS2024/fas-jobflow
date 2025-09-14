import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashedPassword, role });
    await user.save();
    return { message: 'User registered successfully' };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id, role: user.role };
    const access_token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN });
    const refresh_token = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
    return { access_token, refresh_token };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.userModel.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.login(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}


import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { UserRole } from '../schemas/user.schema';
import { Tokens } from './dto/tokens.output';
import { AuthResponse } from './dto/auth-response.output';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signup(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    await this.authService.signup(username, password, UserRole.REQUESTER);
    return { message: 'User registered successfully' };
  }

  @Mutation(() => Tokens)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<Tokens> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Mutation(() => Tokens)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshToken(refreshToken);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  secureData() {
    return 'This data is protected and requires JWT!';
  }
}

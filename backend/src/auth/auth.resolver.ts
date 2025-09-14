import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { UserRole } from '../schemas/user.schema';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  async signup(@Args('username') username: string, @Args('password') password: string) {
    await this.authService.signup(username, password, UserRole.REQUESTER);
    return 'User registered successfully';
  }

  @Mutation(() => String)
  async login(@Args('username') username: string, @Args('password') password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.authService.login(user);
    return JSON.stringify(tokens);
  }

  @Mutation(() => String)
  async refreshToken(@Args('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshToken(refreshToken);
    return JSON.stringify(tokens);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  secureData() {
    return 'This data is protected and requires JWT!';
  }
}

import { ObjectType, Field } from '@nestjs/graphql';
import { Tokens } from './tokens.output';

@ObjectType()
export class AuthResponse {
  @Field()
  message: string;

  @Field(() => Tokens, { nullable: true })
  tokens?: Tokens;
}

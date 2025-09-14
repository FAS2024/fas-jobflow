import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'; 
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Load .env variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Async Mongoose setup with ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        if (!mongoUri) {
          throw new Error('MONGO_URI environment variable is not set!');
        }
        return {
          uri: mongoUri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),

    // GraphQL setup with required driver
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: process.env.NODE_ENV !== 'production',
      subscriptions: { 'graphql-ws': true },
      context: ({ req }) => ({ req }),
    }),

    AuthModule,
  ],
})
export class AppModule {}

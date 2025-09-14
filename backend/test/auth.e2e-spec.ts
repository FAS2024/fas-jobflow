import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';


describe('Auth GraphQL (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should signup a new user', async () => {
    const mutation = `
      mutation {
        signup(username: "testuserE2E", password: "123456") {
          message
        }
      }
    `;

    const res = await supertest(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation });

    expect(res.body.data.signup.message).toBe('User registered successfully');
  });

  it('should login and return tokens', async () => {
    const mutation = `
      mutation {
        login(username: "testuserE2E", password: "123456") {
          access_token
          refresh_token
        }
      }
    `;

    const res = await supertest(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation });

    expect(res.body.data.login.access_token).toBeDefined();
    expect(res.body.data.login.refresh_token).toBeDefined();

    (global as any).accessToken = res.body.data.login.access_token;
  });

  it('should access secureData with valid JWT', async () => {
    const query = `
      query {
        secureData
      }
    `;

    const res = await supertest(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${(global as any).accessToken}`)
      .send({ query });

    expect(res.body.data.secureData).toBe(
      'This data is protected and requires JWT!'
    );
  });
});

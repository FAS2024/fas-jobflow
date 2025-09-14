import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS for frontend with credentials
  app.enableCors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true, // allow cookies and authorization headers
  });

  const port = process.env.PORT || 4000; 
  await app.listen(port);
  console.log(`🚀 FAS Job Flow Backend running at http://localhost:${port}/graphql`);
}
bootstrap();



// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(new ValidationPipe());
//   app.enableCors(); // Allow all origins for now, restrict when frontend is ready

//   const port = process.env.PORT || 3000;
//   await app.listen(port);
//   console.log(`🚀 FAS Job Flow Backend running at http://localhost:${port}/graphql`);
// }
// bootstrap();


// // import { NestFactory } from '@nestjs/core';
// // import { AppModule } from './app.module';

// // async function bootstrap() {
// //   const app = await NestFactory.create(AppModule);
// //   await app.listen(process.env.PORT ?? 3000);
// // }
// // bootstrap();

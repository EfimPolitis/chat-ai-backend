import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : 'https://profunions.ru',
    ],
  });

  await app.listen(5000);
}
bootstrap();

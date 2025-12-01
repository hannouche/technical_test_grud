import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3005'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 8001);
  await app.listen(port);
  Logger.log(`API running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  Logger.error(`Failed to start server: ${errorMsg}`, error instanceof Error ? error.stack : undefined, 'Bootstrap');
  process.exit(1);
});

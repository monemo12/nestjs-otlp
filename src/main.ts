import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { otelSDK } from './tracing';

async function bootstrap() {
  // Start OpenTelemetry before anything else
  await otelSDK.start();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

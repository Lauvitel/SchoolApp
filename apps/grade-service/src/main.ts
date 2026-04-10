import { NestFactory } from '@nestjs/core';
import { GradeServiceModule } from './grade-service.module';

async function bootstrap() {
  const app = await NestFactory.create(GradeServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

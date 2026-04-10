import { NestFactory } from '@nestjs/core';
import { ClassServiceModule } from './class-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ClassServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

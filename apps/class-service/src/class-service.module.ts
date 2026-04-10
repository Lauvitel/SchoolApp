import { Module } from '@nestjs/common';
import { ClassServiceController } from './class-service.controller';
import { ClassServiceService } from './class-service.service';

@Module({
  imports: [],
  controllers: [ClassServiceController],
  providers: [ClassServiceService],
})
export class ClassServiceModule {}

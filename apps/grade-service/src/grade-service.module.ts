import { Module } from '@nestjs/common';
import { GradeServiceController } from './grade-service.controller';
import { GradeServiceService } from './grade-service.service';

@Module({
  imports: [],
  controllers: [GradeServiceController],
  providers: [GradeServiceService],
})
export class GradeServiceModule {}

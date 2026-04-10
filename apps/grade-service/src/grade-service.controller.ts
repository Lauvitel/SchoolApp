import { Controller, Get } from '@nestjs/common';
import { GradeServiceService } from './grade-service.service';

@Controller()
export class GradeServiceController {
  constructor(private readonly gradeServiceService: GradeServiceService) {}

  @Get()
  getHello(): string {
    return this.gradeServiceService.getHello();
  }
}

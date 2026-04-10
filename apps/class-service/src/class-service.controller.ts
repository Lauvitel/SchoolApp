import { Controller, Get } from '@nestjs/common';
import { ClassServiceService } from './class-service.service';

@Controller()
export class ClassServiceController {
  constructor(private readonly classServiceService: ClassServiceService) {}

  @Get()
  getHello(): string {
    return this.classServiceService.getHello();
  }
}

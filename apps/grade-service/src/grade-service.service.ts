import { Injectable } from '@nestjs/common';

@Injectable()
export class GradeServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

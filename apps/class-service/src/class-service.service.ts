import { Injectable } from '@nestjs/common';

@Injectable()
export class ClassServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

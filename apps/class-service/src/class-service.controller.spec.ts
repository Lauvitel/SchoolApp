import { Test, TestingModule } from '@nestjs/testing';
import { ClassServiceController } from './class-service.controller';
import { ClassServiceService } from './class-service.service';

describe('ClassServiceController', () => {
  let classServiceController: ClassServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ClassServiceController],
      providers: [ClassServiceService],
    }).compile();

    classServiceController = app.get<ClassServiceController>(ClassServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(classServiceController.getHello()).toBe('Hello World!');
    });
  });
});

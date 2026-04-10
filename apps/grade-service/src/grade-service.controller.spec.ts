import { Test, TestingModule } from '@nestjs/testing';
import { GradeServiceController } from './grade-service.controller';
import { GradeServiceService } from './grade-service.service';

describe('GradeServiceController', () => {
  let gradeServiceController: GradeServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GradeServiceController],
      providers: [GradeServiceService],
    }).compile();

    gradeServiceController = app.get<GradeServiceController>(GradeServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gradeServiceController.getHello()).toBe('Hello World!');
    });
  });
});

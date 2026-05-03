import { Test, TestingModule } from '@nestjs/testing';
import { GradesResolver } from './grades.resolver';
import { GradesService } from './grades.service';

const mockGradesService = {
  create: jest.fn(),
  findMyGrades: jest.fn(),
  findStudentGrades: jest.fn(),
  findCourseStats: jest.fn(),
  findClassStats: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockGrade = {
  id: 'grade-1',
  studentId: 'student-1',
  professorId: 'prof-1',
  classId: 'class-1',
  courseName: 'Math',
  value: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  userId: 'prof-1',
  email: 'prof@test.com',
  role: 'PROFESSOR',
};

const mockStudent = {
  userId: 'student-1',
  email: 'student@test.com',
  role: 'STUDENT',
};

describe('GradesResolver', () => {
  let resolver: GradesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesResolver,
        { provide: GradesService, useValue: mockGradesService },
      ],
    }).compile();

    resolver = module.get<GradesResolver>(GradesResolver);
    jest.clearAllMocks();
  });

  describe('myGrades', () => {
    it('should return grades for the current student', async () => {
      mockGradesService.findMyGrades.mockResolvedValue([mockGrade]);
      const result = await resolver.myGrades(mockStudent);
      expect(result).toEqual([mockGrade]);
      expect(mockGradesService.findMyGrades).toHaveBeenCalledWith(
        mockStudent,
        undefined,
      );
    });

    it('should pass filter when provided', async () => {
      mockGradesService.findMyGrades.mockResolvedValue([mockGrade]);
      const filter = { courseName: 'Math' };
      await resolver.myGrades(mockStudent, filter);
      expect(mockGradesService.findMyGrades).toHaveBeenCalledWith(
        mockStudent,
        filter,
      );
    });
  });

  describe('studentGrades', () => {
    it('should return grades for a specific student', async () => {
      mockGradesService.findStudentGrades.mockResolvedValue([mockGrade]);
      const filter = { studentId: 'student-1' };
      const result = await resolver.studentGrades(filter);
      expect(result).toEqual([mockGrade]);
    });
  });

  describe('courseStats', () => {
    it('should return stats for a course', async () => {
      const stats = { count: 5, average: 14, median: 14, min: 10, max: 18 };
      mockGradesService.findCourseStats.mockResolvedValue(stats);
      const result = await resolver.courseStats({ courseName: 'Math' });
      expect(result).toEqual(stats);
    });
  });

  describe('classStats', () => {
    it('should return stats for a class', async () => {
      const stats = { count: 3, average: 12, median: 12, min: 8, max: 16 };
      mockGradesService.findClassStats.mockResolvedValue(stats);
      const result = await resolver.classStats({ classId: 'class-1' });
      expect(result).toEqual(stats);
    });
  });

  describe('createGrade', () => {
    it('should create a grade with current user as professor', async () => {
      mockGradesService.create.mockResolvedValue(mockGrade);
      const input = { studentId: 'student-1', courseName: 'Math', value: 15 };
      const result = await resolver.createGrade(mockUser, input);
      expect(result).toEqual(mockGrade);
      expect(mockGradesService.create).toHaveBeenCalledWith(input, mockUser);
    });
  });

  describe('updateGrade', () => {
    it('should update a grade', async () => {
      const updated = { ...mockGrade, value: 18 };
      mockGradesService.update.mockResolvedValue(updated);
      const result = await resolver.updateGrade('grade-1', { value: 18 });
      expect(result.value).toBe(18);
    });
  });

  describe('deleteGrade', () => {
    it('should delete a grade', async () => {
      mockGradesService.delete.mockResolvedValue(mockGrade);
      const result = await resolver.deleteGrade('grade-1');
      expect(result).toEqual(mockGrade);
    });
  });
});

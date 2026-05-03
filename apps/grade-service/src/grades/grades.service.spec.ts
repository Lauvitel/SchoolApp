import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GradesService } from './grades.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  grade: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('GradesService', () => {
  let service: GradesService;

  const currentUser = {
    userId: 'prof-1',
    email: 'prof@test.com',
    role: 'PROFESSOR',
  };
  const student = {
    userId: 'student-1',
    email: 'student@test.com',
    role: 'STUDENT',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GradesService>(GradesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a grade with professor id', async () => {
      mockPrisma.grade.create.mockResolvedValue(mockGrade);

      const result = await service.create(
        {
          studentId: 'student-1',
          classId: 'class-1',
          courseName: 'Math',
          value: 15,
        },
        currentUser,
      );

      expect(mockPrisma.grade.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student-1',
          professorId: 'prof-1',
          classId: 'class-1',
          courseName: 'Math',
          value: 15,
        },
      });
      expect(result).toEqual(mockGrade);
    });

    it('should set classId to null when not provided', async () => {
      mockPrisma.grade.create.mockResolvedValue(mockGrade);

      await service.create(
        { studentId: 'student-1', courseName: 'Math', value: 15 },
        currentUser,
      );

      expect(mockPrisma.grade.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ classId: null }),
      });
    });
  });

  describe('findMyGrades', () => {
    it('should return grades for current student', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([mockGrade]);
      const result = await service.findMyGrades(student);
      expect(mockPrisma.grade.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        orderBy: undefined,
      });
      expect(result).toEqual([mockGrade]);
    });

    it('should filter by single courseName', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([mockGrade]);
      await service.findMyGrades(student, { courseName: 'Math' });
      expect(mockPrisma.grade.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1', courseName: 'Math' },
        orderBy: undefined,
      });
    });

    it('should filter by multiple courseNames', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([mockGrade]);
      await service.findMyGrades(student, { courseNames: ['Math', 'Physics'] });
      expect(mockPrisma.grade.findMany).toHaveBeenCalledWith({
        where: {
          studentId: 'student-1',
          courseName: { in: ['Math', 'Physics'] },
        },
        orderBy: undefined,
      });
    });
  });

  describe('findStudentGrades', () => {
    it('should return grades for a specific student', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([mockGrade]);
      const result = await service.findStudentGrades({
        studentId: 'student-1',
      });
      expect(result).toEqual([mockGrade]);
    });
  });

  describe('update', () => {
    it('should update a grade', async () => {
      mockPrisma.grade.findUnique.mockResolvedValue(mockGrade);
      mockPrisma.grade.update.mockResolvedValue({ ...mockGrade, value: 18 });

      const result = await service.update('grade-1', { value: 18 });
      expect(result.value).toBe(18);
    });

    it('should throw if grade not found', async () => {
      mockPrisma.grade.findUnique.mockResolvedValue(null);
      await expect(service.update('not-found', { value: 18 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a grade', async () => {
      mockPrisma.grade.findUnique.mockResolvedValue(mockGrade);
      mockPrisma.grade.delete.mockResolvedValue(mockGrade);

      const result = await service.delete('grade-1');
      expect(result).toEqual(mockGrade);
    });
  });

  describe('findCourseStats', () => {
    it('should compute stats for a course', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { value: 10 },
        { value: 12 },
        { value: 14 },
        { value: 16 },
        { value: 18 },
      ]);

      const result = await service.findCourseStats({ courseName: 'Math' });
      expect(result).toEqual({
        count: 5,
        average: 14,
        median: 14,
        min: 10,
        max: 18,
      });
    });

    it('should filter by classId when provided', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([]);
      await service.findCourseStats({ courseName: 'Math', classId: 'class-1' });
      expect(mockPrisma.grade.findMany).toHaveBeenCalledWith({
        where: { courseName: 'Math', classId: 'class-1' },
      });
    });
  });

  describe('findClassStats', () => {
    it('should compute stats for a class', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { value: 8 },
        { value: 12 },
      ]);

      const result = await service.findClassStats({ classId: 'class-1' });
      expect(result).toEqual({
        count: 2,
        average: 10,
        median: 10,
        min: 8,
        max: 12,
      });
    });
  });

  describe('computeStats (via findCourseStats)', () => {
    it('should return zeros for empty grades', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([]);
      const result = await service.findCourseStats({ courseName: 'Empty' });
      expect(result).toEqual({
        count: 0,
        average: 0,
        median: 0,
        min: 0,
        max: 0,
      });
    });

    it('should handle single grade', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([{ value: 15 }]);
      const result = await service.findCourseStats({ courseName: 'Solo' });
      expect(result).toEqual({
        count: 1,
        average: 15,
        median: 15,
        min: 15,
        max: 15,
      });
    });

    it('should compute correct median for even count', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { value: 10 },
        { value: 20 },
      ]);
      const result = await service.findCourseStats({ courseName: 'Even' });
      expect(result.median).toBe(15);
    });

    it('should compute correct median for odd count', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { value: 5 },
        { value: 10 },
        { value: 20 },
      ]);
      const result = await service.findCourseStats({ courseName: 'Odd' });
      expect(result.median).toBe(10);
    });

    it('should round average to 2 decimals', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { value: 10 },
        { value: 11 },
        { value: 12 },
      ]);
      const result = await service.findCourseStats({ courseName: 'Rounding' });
      expect(result.average).toBe(11);
    });
  });
});

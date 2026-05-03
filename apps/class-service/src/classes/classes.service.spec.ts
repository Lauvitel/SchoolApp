import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma/prisma.service';
import { SortOrder } from '../common/enums/sort-order.enum';

const mockPrisma = {
  schoolClass: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  classStudent: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('ClassesService', () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    jest.clearAllMocks();
  });

  const mockClass = {
    id: 'class-1',
    name: 'Mathematics',
    students: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClassWithStudents = {
    ...mockClass,
    students: [{ id: 'cs-1', classId: 'class-1', studentId: 'student-1' }],
  };

  describe('findAll', () => {
    it('should return all classes', async () => {
      mockPrisma.schoolClass.findMany.mockResolvedValue([mockClass]);
      const result = await service.findAll();
      expect(result).toEqual([mockClass]);
    });

    it('should sort by name when filter provided', async () => {
      mockPrisma.schoolClass.findMany.mockResolvedValue([mockClass]);
      await service.findAll({ sortByName: SortOrder.ASC });
      expect(mockPrisma.schoolClass.findMany).toHaveBeenCalledWith({
        include: { students: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return class by id', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(mockClass);
      const result = await service.findById('class-1');
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(null);
      await expect(service.findById('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a class', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(null);
      mockPrisma.schoolClass.create.mockResolvedValue(mockClass);

      const result = await service.create({ name: 'Mathematics' });
      expect(result).toEqual(mockClass);
    });

    it('should throw if name already exists', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(mockClass);
      await expect(service.create({ name: 'Mathematics' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValueOnce(mockClass);
      mockPrisma.schoolClass.findUnique.mockResolvedValueOnce(null);
      mockPrisma.schoolClass.update.mockResolvedValue({
        ...mockClass,
        name: 'Physics',
      });

      const result = await service.update('class-1', { name: 'Physics' });
      expect(result.name).toBe('Physics');
    });

    it('should throw if new name taken by another class', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValueOnce(mockClass);
      mockPrisma.schoolClass.findUnique.mockResolvedValueOnce({
        ...mockClass,
        id: 'other-id',
      });

      await expect(
        service.update('class-1', { name: 'Physics' }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('delete', () => {
    it('should delete a class with no students', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(mockClass);
      mockPrisma.schoolClass.delete.mockResolvedValue(mockClass);

      const result = await service.delete('class-1');
      expect(result).toEqual(mockClass);
    });

    it('should throw if class still has students', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(
        mockClassWithStudents,
      );

      await expect(service.delete('class-1')).rejects.toThrow(
        'Cannot delete a class that still has students',
      );
    });
  });

  describe('addStudentToClass', () => {
    it('should add a student to a class', async () => {
      mockPrisma.schoolClass.findUnique
        .mockResolvedValueOnce(mockClass)
        .mockResolvedValueOnce(mockClassWithStudents);
      mockPrisma.classStudent.findUnique.mockResolvedValue(null);
      mockPrisma.classStudent.create.mockResolvedValue({});

      const result = await service.addStudentToClass({
        classId: 'class-1',
        studentId: 'student-1',
      });
      expect(result.students).toHaveLength(1);
    });

    it('should throw if student already assigned', async () => {
      mockPrisma.schoolClass.findUnique.mockResolvedValue(mockClass);
      mockPrisma.classStudent.findUnique.mockResolvedValue({ id: 'cs-1' });

      await expect(
        service.addStudentToClass({
          classId: 'class-1',
          studentId: 'student-1',
        }),
      ).rejects.toThrow('already assigned');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ClassesResolver } from './classes.resolver';
import { ClassesService } from './classes.service';

const mockClassesService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addStudentToClass: jest.fn(),
};

const mockClass = {
  id: 'class-1',
  name: 'Mathematics',
  students: [{ id: 's1', classId: 'class-1', studentId: 'student-1' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ClassesResolver', () => {
  let resolver: ClassesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesResolver,
        { provide: ClassesService, useValue: mockClassesService },
      ],
    }).compile();

    resolver = module.get<ClassesResolver>(ClassesResolver);
    jest.clearAllMocks();
  });

  describe('classes', () => {
    it('should return all classes', async () => {
      mockClassesService.findAll.mockResolvedValue([mockClass]);
      const result = await resolver.classes();
      expect(result).toEqual([mockClass]);
      expect(mockClassesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass filter to service', async () => {
      mockClassesService.findAll.mockResolvedValue([]);
      const filter = { sortByName: 'asc' as const };
      await resolver.classes(filter);
      expect(mockClassesService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('getClass', () => {
    it('should return a class by id', async () => {
      mockClassesService.findById.mockResolvedValue(mockClass);
      const result = await resolver.getClass('class-1');
      expect(result).toEqual(mockClass);
    });
  });

  describe('createClass', () => {
    it('should create a class', async () => {
      mockClassesService.create.mockResolvedValue(mockClass);
      const result = await resolver.createClass({ name: 'Mathematics' });
      expect(result).toEqual(mockClass);
      expect(mockClassesService.create).toHaveBeenCalledWith({
        name: 'Mathematics',
      });
    });
  });

  describe('updateClass', () => {
    it('should update a class', async () => {
      const updated = { ...mockClass, name: 'Physics' };
      mockClassesService.update.mockResolvedValue(updated);
      const result = await resolver.updateClass('class-1', { name: 'Physics' });
      expect(result.name).toBe('Physics');
    });
  });

  describe('deleteClass', () => {
    it('should delete a class', async () => {
      mockClassesService.delete.mockResolvedValue(mockClass);
      const result = await resolver.deleteClass('class-1');
      expect(result).toEqual(mockClass);
    });
  });

  describe('addStudentToClass', () => {
    it('should add a student to a class', async () => {
      const classWithStudent = {
        ...mockClass,
        students: [
          ...mockClass.students,
          { id: 's2', classId: 'class-1', studentId: 'student-2' },
        ],
      };
      mockClassesService.addStudentToClass.mockResolvedValue(classWithStudent);
      const result = await resolver.addStudentToClass({
        classId: 'class-1',
        studentId: 'student-2',
      });
      expect(result.students).toHaveLength(2);
    });
  });

  describe('studentCount', () => {
    it('should return the number of students', () => {
      const count = resolver.studentCount(mockClass as any);
      expect(count).toBe(1);
    });

    it('should return 0 when no students', () => {
      const count = resolver.studentCount({ students: undefined } as any);
      expect(count).toBe(0);
    });
  });
});

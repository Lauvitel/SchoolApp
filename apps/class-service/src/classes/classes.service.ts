import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { ClassesFilterInput } from './dto/classes-filter.input';
import { AddStudentToClassInput } from './dto/add-student-to-class.input';

const includeStudents = { students: true } as const;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: ClassesFilterInput) {
    return this.prisma.schoolClass.findMany({
      include: includeStudents,
      orderBy: filter?.sortByName ? { name: filter.sortByName } : undefined,
    });
  }

  async findById(id: string) {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id },
      include: includeStudents,
    });
    if (!schoolClass) {
      throw new NotFoundException(`Class with id "${id}" not found`);
    }
    return schoolClass;
  }

  async create(input: CreateClassInput) {
    const existing = await this.prisma.schoolClass.findUnique({
      where: { name: input.name },
    });
    if (existing) {
      throw new BadRequestException(
        `A class with name "${input.name}" already exists`,
      );
    }
    return this.prisma.schoolClass.create({
      data: { name: input.name },
      include: includeStudents,
    });
  }

  async update(id: string, input: UpdateClassInput) {
    await this.findById(id);
    if (input.name) {
      const existing = await this.prisma.schoolClass.findUnique({
        where: { name: input.name },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `A class with name "${input.name}" already exists`,
        );
      }
    }
    return this.prisma.schoolClass.update({
      where: { id },
      data: { ...input },
      include: includeStudents,
    });
  }

  async delete(id: string) {
    const schoolClass = await this.findById(id);
    if (schoolClass.students.length > 0) {
      throw new BadRequestException(
        'Cannot delete a class that still has students. Remove all students first.',
      );
    }
    return this.prisma.schoolClass.delete({
      where: { id },
      include: includeStudents,
    });
  }

  async addStudentToClass(input: AddStudentToClassInput) {
    await this.findById(input.classId);
    const existing = await this.prisma.classStudent.findUnique({
      where: {
        classId_studentId: {
          classId: input.classId,
          studentId: input.studentId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This student is already assigned to this class',
      );
    }
    await this.prisma.classStudent.create({
      data: {
        classId: input.classId,
        studentId: input.studentId,
      },
    });
    return this.findById(input.classId);
  }
}

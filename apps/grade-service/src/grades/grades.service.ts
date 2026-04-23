import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeInput } from './dto/create-grade.input';
import { UpdateGradeInput } from './dto/update-grade.input';
import { MyGradesFilterInput } from './dto/my-grades-filter.input';
import { StudentGradesFilterInput } from './dto/student-grades-filter.input';
import { CourseStatsInput } from './dto/course-stats.input';
import { ClassStatsInput } from './dto/class-stats.input';
import { GradeStatsModel } from './models/grade-stats.model';

interface CurrentUser {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateGradeInput, currentUser: CurrentUser) {
    return this.prisma.grade.create({
      data: {
        studentId: input.studentId,
        professorId: currentUser.userId,
        classId: input.classId ?? null,
        courseName: input.courseName,
        value: input.value,
      },
    });
  }

  async findMyGrades(currentUser: CurrentUser, filter?: MyGradesFilterInput) {
    const where: Record<string, unknown> = { studentId: currentUser.userId };

    if (filter?.courseName) {
      where.courseName = filter.courseName;
    } else if (filter?.courseNames && filter.courseNames.length > 0) {
      where.courseName = { in: filter.courseNames };
    }

    return this.prisma.grade.findMany({
      where,
      orderBy: filter?.sortOrder ? { createdAt: filter.sortOrder } : undefined,
    });
  }

  async findStudentGrades(filter: StudentGradesFilterInput) {
    const where: Record<string, unknown> = { studentId: filter.studentId };

    if (filter.courseName) {
      where.courseName = filter.courseName;
    } else if (filter.courseNames && filter.courseNames.length > 0) {
      where.courseName = { in: filter.courseNames };
    }

    return this.prisma.grade.findMany({
      where,
      orderBy: filter.sortOrder ? { createdAt: filter.sortOrder } : undefined,
    });
  }

  async findCourseStats(input: CourseStatsInput): Promise<GradeStatsModel> {
    const where: Record<string, unknown> = { courseName: input.courseName };
    if (input.classId) {
      where.classId = input.classId;
    }

    const grades = await this.prisma.grade.findMany({ where });
    return this.computeStats(grades.map((g) => g.value));
  }

  async findClassStats(input: ClassStatsInput): Promise<GradeStatsModel> {
    const where: Record<string, unknown> = { classId: input.classId };
    if (input.courseName) {
      where.courseName = input.courseName;
    }

    const grades = await this.prisma.grade.findMany({ where });
    return this.computeStats(grades.map((g) => g.value));
  }

  async update(id: string, input: UpdateGradeInput) {
    await this.findById(id);
    return this.prisma.grade.update({
      where: { id },
      data: { ...input },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.grade.delete({ where: { id } });
  }

  private async findById(id: string) {
    const grade = await this.prisma.grade.findUnique({ where: { id } });
    if (!grade) {
      throw new NotFoundException(`Grade with id "${id}" not found`);
    }
    return grade;
  }

  private computeStats(values: number[]): GradeStatsModel {
    if (values.length === 0) {
      return { count: 0, average: 0, median: 0, min: 0, max: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const average =
      Math.round((sorted.reduce((sum, v) => sum + v, 0) / count) * 100) / 100;

    let median: number;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
    } else {
      median = sorted[mid];
    }

    return { count, average, median, min, max };
  }
}

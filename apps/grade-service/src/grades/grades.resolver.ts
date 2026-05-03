import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GradeModel } from './models/grade.model';
import { GradeStatsModel } from './models/grade-stats.model';
import { GradesService } from './grades.service';
import { CreateGradeInput } from './dto/create-grade.input';
import { UpdateGradeInput } from './dto/update-grade.input';
import { MyGradesFilterInput } from './dto/my-grades-filter.input';
import { StudentGradesFilterInput } from './dto/student-grades-filter.input';
import { CourseStatsInput } from './dto/course-stats.input';
import { ClassStatsInput } from './dto/class-stats.input';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => GradeModel)
export class GradesResolver {
  constructor(private readonly gradesService: GradesService) {}

  @Query(() => [GradeModel])
  @UseGuards(GqlAuthGuard)
  async myGrades(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Args('filter', { nullable: true }) filter?: MyGradesFilterInput,
  ) {
    return this.gradesService.findMyGrades(user, filter);
  }

  @Query(() => [GradeModel])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async studentGrades(@Args('filter') filter: StudentGradesFilterInput) {
    return this.gradesService.findStudentGrades(filter);
  }

  @Query(() => GradeStatsModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async courseStats(@Args('input') input: CourseStatsInput) {
    return this.gradesService.findCourseStats(input);
  }

  @Query(() => GradeStatsModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async classStats(@Args('input') input: ClassStatsInput) {
    return this.gradesService.findClassStats(input);
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async courseNames(): Promise<string[]> {
    return this.gradesService.distinctCourseNames();
  }

  @Mutation(() => GradeModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async createGrade(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Args('input') input: CreateGradeInput,
  ) {
    return this.gradesService.create(input, user);
  }

  @Mutation(() => GradeModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async updateGrade(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGradeInput,
  ) {
    return this.gradesService.update(id, input);
  }

  @Mutation(() => GradeModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async deleteGrade(@Args('id', { type: () => ID }) id: string) {
    return this.gradesService.delete(id);
  }
}

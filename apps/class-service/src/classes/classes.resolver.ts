import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ClassModel } from './models/class.model';
import { ClassesService } from './classes.service';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { ClassesFilterInput } from './dto/classes-filter.input';
import { AddStudentToClassInput } from './dto/add-student-to-class.input';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => ClassModel)
export class ClassesResolver {
  constructor(private readonly classesService: ClassesService) {}

  @ResolveField(() => Number)
  studentCount(@Parent() schoolClass: ClassModel): number {
    return schoolClass.students?.length ?? 0;
  }

  @Query(() => [ClassModel])
  async classes(
    @Args('filter', { nullable: true }) filter?: ClassesFilterInput,
  ) {
    return this.classesService.findAll(filter);
  }

  @Query(() => ClassModel, { name: 'class' })
  async getClass(@Args('id', { type: () => ID }) id: string) {
    return this.classesService.findById(id);
  }

  @Mutation(() => ClassModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async createClass(@Args('input') input: CreateClassInput) {
    return this.classesService.create(input);
  }

  @Mutation(() => ClassModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async updateClass(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateClassInput,
  ) {
    return this.classesService.update(id, input);
  }

  @Mutation(() => ClassModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async deleteClass(@Args('id', { type: () => ID }) id: string) {
    return this.classesService.delete(id);
  }

  @Mutation(() => ClassModel)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSOR)
  async addStudentToClass(@Args('input') input: AddStudentToClassInput) {
    return this.classesService.addStudentToClass(input);
  }
}

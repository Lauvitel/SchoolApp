import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ClassStudentModel } from './class-student.model';

@ObjectType('SchoolClass')
export class ClassModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [ClassStudentModel])
  students: ClassStudentModel[];

  @Field(() => Int)
  studentCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

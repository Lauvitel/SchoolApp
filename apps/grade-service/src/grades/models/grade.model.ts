import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class GradeModel {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;

  @Field()
  professorId: string;

  @Field(() => String, { nullable: true })
  classId?: string | null;

  @Field()
  courseName: string;

  @Field(() => Float)
  value: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

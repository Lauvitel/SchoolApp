import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ClassStudentModel {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;
}

import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class AddStudentToClassInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  studentId: string;
}

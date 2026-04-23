import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CourseStatsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  classId?: string;
}

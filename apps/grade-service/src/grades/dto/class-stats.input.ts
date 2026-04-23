import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class ClassStatsInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseName?: string;
}

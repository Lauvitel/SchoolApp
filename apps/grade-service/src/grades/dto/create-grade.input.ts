import { InputType, Field, Float, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateGradeInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(20)
  value: number;
}

import { InputType, Field, Float, ID } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class UpdateGradeInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseName?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  value?: number;
}

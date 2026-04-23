import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SortOrder } from '../../common/enums/sort-order.enum';

@InputType()
export class StudentGradesFilterInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseName?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  courseNames?: string[];

  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  sortOrder?: SortOrder;
}

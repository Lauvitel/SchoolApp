import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { SortOrder } from '../../common/enums/sort-order.enum';

@InputType()
export class MyGradesFilterInput {
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

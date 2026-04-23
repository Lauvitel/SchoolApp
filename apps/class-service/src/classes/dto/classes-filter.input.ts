import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { SortOrder } from '../../common/enums/sort-order.enum';

@InputType()
export class ClassesFilterInput {
  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  sortByName?: SortOrder;
}

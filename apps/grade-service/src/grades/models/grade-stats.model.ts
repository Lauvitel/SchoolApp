import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class GradeStatsModel {
  @Field(() => Int)
  count: number;

  @Field(() => Float)
  average: number;

  @Field(() => Float)
  median: number;

  @Field(() => Float)
  min: number;

  @Field(() => Float)
  max: number;
}

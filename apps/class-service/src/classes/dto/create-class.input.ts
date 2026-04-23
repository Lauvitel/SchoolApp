import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateClassInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}

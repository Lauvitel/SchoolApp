import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import { UserRole } from '../../common/enums/user-role.enum';

@ObjectType()
@Directive('@key(fields: "id")')
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  pseudo: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

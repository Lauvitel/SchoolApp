import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserModel)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserModel> {
    return this.usersService.findById(id);
  }

  @Query(() => UserModel)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: { userId: string }): Promise<UserModel> {
    return this.usersService.findById(user.userId);
  }

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard)
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Args('input') input: UpdateUserInput,
  ): Promise<UserModel> {
    return this.usersService.updateMe(user.userId, input);
  }

  @Mutation(() => UserModel)
  @UseGuards(GqlAuthGuard)
  async deleteMe(@CurrentUser() user: { userId: string }): Promise<UserModel> {
    return this.usersService.deleteMe(user.userId);
  }
}

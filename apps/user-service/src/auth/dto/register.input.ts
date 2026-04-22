import { InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../../users/dto/create-user.input';

@InputType()
export class RegisterInput extends CreateUserInput {}

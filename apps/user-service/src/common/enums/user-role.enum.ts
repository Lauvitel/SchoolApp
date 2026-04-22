import { registerEnumType } from '@nestjs/graphql';
import { $Enums } from '../../../../../generated/user-service-client';

export type UserRole = $Enums.UserRole;
export const UserRole = $Enums.UserRole;

registerEnumType(UserRole, { name: 'UserRole' });

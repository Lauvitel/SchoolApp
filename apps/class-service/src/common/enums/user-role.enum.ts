import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
}

registerEnumType(UserRole, { name: 'UserRole' });

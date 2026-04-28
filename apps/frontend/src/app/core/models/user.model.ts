export type UserRole = 'STUDENT' | 'PROFESSOR';

export interface User {
  id: string;
  email: string;
  pseudo: string;
  role: UserRole;
}

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./features/classes/classes-list/classes-list.component').then((m) => m.ClassesListComponent),
  },
  {
    path: 'classes/:id',
    loadComponent: () =>
      import('./features/classes/class-detail/class-detail.component').then((m) => m.ClassDetailComponent),
  },
  {
    path: 'my-grades',
    loadComponent: () =>
      import('./features/grades/my-grades/my-grades.component').then((m) => m.MyGradesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'professor',
    loadComponent: () =>
      import('./features/professor/professor-dashboard/professor-dashboard.component').then(
        (m) => m.ProfessorDashboardComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PROFESSOR' },
  },
  {
    path: '',
    redirectTo: 'classes',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'classes',
  },
];

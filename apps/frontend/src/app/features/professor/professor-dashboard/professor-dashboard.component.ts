import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './professor-dashboard.component.html',
  styleUrl: './professor-dashboard.component.scss',
})
export class ProfessorDashboardComponent {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}

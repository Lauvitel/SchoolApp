import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pseudo: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, pseudo, password, role } = this.registerForm.value as {
      email: string;
      pseudo: string;
      password: string;
      role: string;
    };
    this.authService
      .register({ email, pseudo, password, role: role as UserRole })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.user.role === 'PROFESSOR') {
            void this.router.navigate(['/professor']);
          } else {
            void this.router.navigate(['/profile']);
          }
        },
        error: (err: unknown) => {
          this.loading = false;
          this.errorMessage = getErrorMessage(
            err,
            "Erreur lors de l'inscription",
          );
        },
      });
  }
}

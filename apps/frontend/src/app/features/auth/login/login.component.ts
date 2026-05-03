import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value as {
      email: string;
      password: string;
    };
    this.authService.login(email, password).subscribe({
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
        this.errorMessage = getErrorMessage(err, 'Erreur lors de la connexion');
      },
    });
  }
}

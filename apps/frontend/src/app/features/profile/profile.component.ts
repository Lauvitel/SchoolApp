import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ME_QUERY,
  UPDATE_ME_MUTATION,
  DELETE_ME_MUTATION,
} from '../../core/graphql/users.graphql';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { getErrorMessage } from '../../core/utils/error.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  editing = false;
  editForm!: FormGroup;
  saving = false;

  showDeleteConfirm = false;
  deleting = false;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pseudo: ['', [Validators.required]],
      password: ['', [Validators.minLength(6)]],
    });

    this.apollo
      .watchQuery<{ me: User }>({ query: ME_QUERY })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = loading;
          this.user = (data?.me as User) ?? null;
        },
        error: (err: unknown) => {
          this.loading = false;
          this.errorMessage = getErrorMessage(
            err,
            'Erreur lors du chargement du profil',
          );
        },
      });
  }

  startEditing(): void {
    if (!this.user) return;
    this.editForm.patchValue({
      email: this.user.email,
      pseudo: this.user.pseudo,
      password: '',
    });
    this.editing = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEditing(): void {
    this.editing = false;
    this.errorMessage = null;
  }

  saveProfile(): void {
    if (this.editForm.invalid || this.saving) return;

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { email, pseudo, password } = this.editForm.value as {
      email: string;
      pseudo: string;
      password: string;
    };

    const input: Record<string, string> = {};
    if (email && email !== this.user?.email) input['email'] = email;
    if (pseudo && pseudo !== this.user?.pseudo) input['pseudo'] = pseudo;
    if (password) input['password'] = password;

    if (Object.keys(input).length === 0) {
      this.saving = false;
      this.editing = false;
      return;
    }

    this.apollo
      .mutate<{ updateMe: User }>({
        mutation: UPDATE_ME_MUTATION,
        variables: { input },
        refetchQueries: [{ query: ME_QUERY }],
      })
      .subscribe({
        next: ({ data }) => {
          this.saving = false;
          this.editing = false;
          this.user = (data?.updateMe as User) ?? this.user;
          this.successMessage = 'Profil mis à jour avec succès';
        },
        error: (err: unknown) => {
          this.saving = false;
          this.errorMessage = getErrorMessage(
            err,
            'Erreur lors de la mise à jour',
          );
        },
      });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteAccount(): void {
    this.deleting = true;
    this.errorMessage = null;

    this.apollo.mutate({ mutation: DELETE_ME_MUTATION }).subscribe({
      next: () => {
        this.deleting = false;
        this.authService.logout();
      },
      error: (err: unknown) => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.errorMessage = getErrorMessage(
          err,
          'Erreur lors de la suppression du compte',
        );
      },
    });
  }
}

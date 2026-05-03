import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CLASSES_QUERY,
  CREATE_CLASS_MUTATION,
  UPDATE_CLASS_MUTATION,
  DELETE_CLASS_MUTATION,
} from '../../../core/graphql/classes.graphql';
import { SchoolClass } from '../../../core/models/class.model';
import { RouterLink } from '@angular/router';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-professor-classes',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './professor-classes.component.html',
  styleUrl: './professor-classes.component.scss',
})
export class ProfessorClassesComponent implements OnInit {
  classes: SchoolClass[] = [];
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  classForm!: FormGroup;
  editingClassId: string | null = null;
  saving = false;

  deleteConfirmId: string | null = null;
  deleting = false;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.classForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.loadClasses();
  }

  loadClasses(): void {
    this.apollo
      .watchQuery<{ classes: SchoolClass[] }>({
        query: CLASSES_QUERY,
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = loading;
          this.classes = (data?.classes as SchoolClass[]) ?? [];
        },
        error: (err: unknown) => {
          this.loading = false;
          this.errorMessage = getErrorMessage(
            err,
            'Erreur lors du chargement des classes',
          );
        },
      });
  }

  startCreate(): void {
    this.editingClassId = null;
    this.classForm.reset({ name: '' });
    this.errorMessage = null;
    this.successMessage = null;
  }

  startEdit(cls: SchoolClass): void {
    this.editingClassId = cls.id;
    this.classForm.patchValue({ name: cls.name });
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.editingClassId = null;
    this.classForm.reset({ name: '' });
  }

  saveClass(): void {
    if (this.classForm.invalid || this.saving) return;
    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const name = this.classForm.value.name as string;

    if (this.editingClassId) {
      this.apollo
        .mutate({
          mutation: UPDATE_CLASS_MUTATION,
          variables: { id: this.editingClassId, input: { name } },
          refetchQueries: [{ query: CLASSES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.editingClassId = null;
            this.classForm.reset({ name: '' });
            this.successMessage = 'Classe modifiée avec succès';
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage =
              err?.message || 'Erreur lors de la modification';
          },
        });
    } else {
      this.apollo
        .mutate({
          mutation: CREATE_CLASS_MUTATION,
          variables: { input: { name } },
          refetchQueries: [{ query: CLASSES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.classForm.reset({ name: '' });
            this.successMessage = 'Classe créée avec succès';
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage = err?.message || 'Erreur lors de la création';
          },
        });
    }
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteClass(id: string): void {
    this.deleting = true;
    this.errorMessage = null;

    this.apollo
      .mutate({
        mutation: DELETE_CLASS_MUTATION,
        variables: { id },
        refetchQueries: [{ query: CLASSES_QUERY }],
      })
      .subscribe({
        next: () => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.successMessage = 'Classe supprimée avec succès';
        },
        error: (err) => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.errorMessage = err?.message || 'Erreur lors de la suppression';
        },
      });
  }
}

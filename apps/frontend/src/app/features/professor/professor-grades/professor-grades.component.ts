import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  STUDENT_GRADES_QUERY,
  CREATE_GRADE_MUTATION,
  UPDATE_GRADE_MUTATION,
  DELETE_GRADE_MUTATION,
} from '../../../core/graphql/grades.graphql';
import { Grade } from '../../../core/models/grade.model';

@Component({
  selector: 'app-professor-grades',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './professor-grades.component.html',
  styleUrl: './professor-grades.component.scss',
})
export class ProfessorGradesComponent implements OnInit {
  grades: Grade[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  gradeForm!: FormGroup;
  searchForm!: FormGroup;
  editingGradeId: string | null = null;
  saving = false;
  deleteConfirmId: string | null = null;
  deleting = false;
  searchedStudentId: string | null = null;

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      studentId: ['', [Validators.required]],
    });
    this.gradeForm = this.fb.group({
      studentId: ['', [Validators.required]],
      classId: [''],
      courseName: ['', [Validators.required]],
      value: [
        null,
        [Validators.required, Validators.min(0), Validators.max(20)],
      ],
    });
  }

  searchGrades(): void {
    if (this.searchForm.invalid) return;
    const studentId = this.searchForm.value.studentId as string;
    this.searchedStudentId = studentId;
    this.loading = true;
    this.errorMessage = null;

    this.apollo
      .query<{ studentGrades: Grade[] }>({
        query: STUDENT_GRADES_QUERY,
        variables: { filter: { studentId } },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.loading = false;
          this.grades = (data?.studentGrades as Grade[]) ?? [];
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.message || 'Erreur lors de la recherche';
        },
      });
  }

  startEdit(grade: Grade): void {
    this.editingGradeId = grade.id;
    this.gradeForm.patchValue({
      studentId: grade.studentId,
      classId: grade.classId || '',
      courseName: grade.courseName,
      value: grade.value,
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.editingGradeId = null;
    this.gradeForm.reset({
      studentId: this.searchedStudentId || '',
      classId: '',
      courseName: '',
      value: null,
    });
  }

  saveGrade(): void {
    if (this.gradeForm.invalid || this.saving) return;
    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { studentId, classId, courseName, value } = this.gradeForm.value as {
      studentId: string;
      classId: string;
      courseName: string;
      value: number;
    };

    if (this.editingGradeId) {
      this.apollo
        .mutate({
          mutation: UPDATE_GRADE_MUTATION,
          variables: {
            id: this.editingGradeId,
            input: {
              courseName,
              value,
              ...(classId ? { classId } : {}),
            },
          },
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.editingGradeId = null;
            this.successMessage = 'Note modifiée avec succès';
            this.searchGrades();
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
          mutation: CREATE_GRADE_MUTATION,
          variables: {
            input: {
              studentId,
              courseName,
              value,
              ...(classId ? { classId } : {}),
            },
          },
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.gradeForm.patchValue({
              courseName: '',
              value: null,
              classId: '',
            });
            this.successMessage = 'Note créée avec succès';
            if (this.searchedStudentId) this.searchGrades();
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

  deleteGrade(id: string): void {
    this.deleting = true;
    this.errorMessage = null;

    this.apollo
      .mutate({
        mutation: DELETE_GRADE_MUTATION,
        variables: { id },
      })
      .subscribe({
        next: () => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.successMessage = 'Note supprimée avec succès';
          this.searchGrades();
        },
        error: (err) => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.errorMessage = err?.message || 'Erreur lors de la suppression';
        },
      });
  }
}

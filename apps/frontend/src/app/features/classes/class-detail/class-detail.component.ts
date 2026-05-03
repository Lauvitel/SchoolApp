import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CLASS_BY_ID_QUERY,
  ADD_STUDENT_TO_CLASS_MUTATION,
} from '../../../core/graphql/classes.graphql';
import { SchoolClass } from '../../../core/models/class.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss',
})
export class ClassDetailComponent implements OnInit {
  schoolClass: SchoolClass | null = null;
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  isProfessor = false;
  addStudentForm!: FormGroup;
  addingStudent = false;

  private classId!: string;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isProfessor = this.authService.getUserRole() === 'PROFESSOR';
    this.addStudentForm = this.fb.group({
      studentId: ['', [Validators.required]],
    });

    this.classId = this.route.snapshot.paramMap.get('id')!;
    this.apollo
      .watchQuery<{ class: SchoolClass }>({
        query: CLASS_BY_ID_QUERY,
        variables: { id: this.classId },
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = loading;
          this.schoolClass = (data?.class as SchoolClass) ?? null;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.message || 'Erreur lors du chargement de la classe';
        },
      });
  }

  addStudent(): void {
    if (this.addStudentForm.invalid || this.addingStudent) return;
    this.addingStudent = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { studentId } = this.addStudentForm.value as { studentId: string };

    this.apollo
      .mutate<{ addStudentToClass: SchoolClass }>({
        mutation: ADD_STUDENT_TO_CLASS_MUTATION,
        variables: {
          input: { classId: this.classId, studentId },
        },
        refetchQueries: [
          { query: CLASS_BY_ID_QUERY, variables: { id: this.classId } },
        ],
      })
      .subscribe({
        next: ({ data }) => {
          this.addingStudent = false;
          this.addStudentForm.reset({ studentId: '' });
          this.schoolClass =
            (data?.addStudentToClass as SchoolClass) ?? this.schoolClass;
          this.successMessage = 'Etudiant ajoute avec succes';
        },
        error: (err) => {
          this.addingStudent = false;
          this.errorMessage = err?.message || "Erreur lors de l'ajout";
        },
      });
  }
}

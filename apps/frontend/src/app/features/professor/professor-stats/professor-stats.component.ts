import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  COURSE_STATS_QUERY,
  CLASS_STATS_QUERY,
} from '../../../core/graphql/grades.graphql';
import { GradeStats } from '../../../core/models/grade-stats.model';

@Component({
  selector: 'app-professor-stats',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './professor-stats.component.html',
  styleUrl: './professor-stats.component.scss',
})
export class ProfessorStatsComponent implements OnInit {
  courseForm!: FormGroup;
  classForm!: FormGroup;

  courseStats: GradeStats | null = null;
  classStats: GradeStats | null = null;

  courseLoading = false;
  classLoading = false;

  courseError: string | null = null;
  classError: string | null = null;

  courseLabel = '';
  classLabel = '';

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      courseName: ['', [Validators.required]],
      classId: [''],
    });
    this.classForm = this.fb.group({
      classId: ['', [Validators.required]],
      courseName: [''],
    });
  }

  searchCourseStats(): void {
    if (this.courseForm.invalid) return;
    this.courseLoading = true;
    this.courseError = null;
    this.courseStats = null;

    const { courseName, classId } = this.courseForm.value as {
      courseName: string;
      classId: string;
    };
    this.courseLabel = courseName;

    this.apollo
      .query<{ courseStats: GradeStats }>({
        query: COURSE_STATS_QUERY,
        variables: { input: { courseName, ...(classId ? { classId } : {}) } },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.courseLoading = false;
          this.courseStats = (data?.courseStats as GradeStats) ?? null;
        },
        error: (err) => {
          this.courseLoading = false;
          this.courseError = err?.message || 'Erreur';
        },
      });
  }

  searchClassStats(): void {
    if (this.classForm.invalid) return;
    this.classLoading = true;
    this.classError = null;
    this.classStats = null;

    const { classId, courseName } = this.classForm.value as {
      classId: string;
      courseName: string;
    };
    this.classLabel = classId;

    this.apollo
      .query<{ classStats: GradeStats }>({
        query: CLASS_STATS_QUERY,
        variables: {
          input: { classId, ...(courseName ? { courseName } : {}) },
        },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.classLoading = false;
          this.classStats = (data?.classStats as GradeStats) ?? null;
        },
        error: (err) => {
          this.classLoading = false;
          this.classError = err?.message || 'Erreur';
        },
      });
  }
}

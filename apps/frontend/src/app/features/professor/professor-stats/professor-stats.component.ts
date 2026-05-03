import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FormsModule } from '@angular/forms';
import {
  COURSE_STATS_QUERY,
  CLASS_STATS_QUERY,
  COURSE_NAMES_QUERY,
} from '../../../core/graphql/grades.graphql';
import { CLASSES_QUERY } from '../../../core/graphql/classes.graphql';
import { GradeStats } from '../../../core/models/grade-stats.model';

interface SimpleClass {
  id: string;
  name: string;
}

@Component({
  selector: 'app-professor-stats',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './professor-stats.component.html',
  styleUrl: './professor-stats.component.scss',
})
export class ProfessorStatsComponent implements OnInit {
  courseStats: GradeStats | null = null;
  classStats: GradeStats | null = null;

  courseLoading = false;
  classLoading = false;

  courseError: string | null = null;
  classError: string | null = null;

  courseLabel = '';
  classLabel = '';

  allCourseNames: string[] = [];
  allClasses: SimpleClass[] = [];

  courseStatsCourse = '';
  filteredCourseStatsCourses: string[] = [];
  courseStatsClass = '';
  filteredCourseStatsClasses: SimpleClass[] = [];
  selectedCourseStatsClass: SimpleClass | null = null;

  classStatsClass = '';
  filteredClassStatsClasses: SimpleClass[] = [];
  selectedClassStatsClass: SimpleClass | null = null;
  classStatsCourse = '';
  filteredClassStatsCourses: string[] = [];

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .query<{ courseNames: string[] }>({
        query: COURSE_NAMES_QUERY,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.allCourseNames = (data?.courseNames as string[]) ?? [];
        },
      });

    this.apollo
      .query<{ classes: SimpleClass[] }>({
        query: CLASSES_QUERY,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.allClasses = (data?.classes as SimpleClass[]) ?? [];
        },
      });
  }

  onCourseStatsCourseChange(): void {
    const term = this.courseStatsCourse.trim().toLowerCase();
    this.filteredCourseStatsCourses =
      term.length > 0
        ? this.allCourseNames.filter((c) => c.toLowerCase().includes(term))
        : [];
  }

  selectCourseStatsCourse(name: string): void {
    this.courseStatsCourse = name;
    this.filteredCourseStatsCourses = [];
  }

  onCourseStatsClassChange(): void {
    this.selectedCourseStatsClass = null;
    const term = this.courseStatsClass.trim().toLowerCase();
    this.filteredCourseStatsClasses =
      term.length > 0
        ? this.allClasses.filter((c) => c.name.toLowerCase().includes(term))
        : [];
  }

  selectCourseStatsClass(cls: SimpleClass): void {
    this.selectedCourseStatsClass = cls;
    this.courseStatsClass = cls.name;
    this.filteredCourseStatsClasses = [];
  }

  searchCourseStats(): void {
    if (!this.courseStatsCourse.trim()) return;
    this.courseLoading = true;
    this.courseError = null;
    this.courseStats = null;
    this.courseLabel = this.courseStatsCourse;

    const classId = this.selectedCourseStatsClass?.id;

    this.apollo
      .query<{ courseStats: GradeStats }>({
        query: COURSE_STATS_QUERY,
        variables: {
          input: {
            courseName: this.courseStatsCourse,
            ...(classId ? { classId } : {}),
          },
        },
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

  onClassStatsClassChange(): void {
    this.selectedClassStatsClass = null;
    const term = this.classStatsClass.trim().toLowerCase();
    this.filteredClassStatsClasses =
      term.length > 0
        ? this.allClasses.filter((c) => c.name.toLowerCase().includes(term))
        : [];
  }

  selectClassStatsClass(cls: SimpleClass): void {
    this.selectedClassStatsClass = cls;
    this.classStatsClass = cls.name;
    this.filteredClassStatsClasses = [];
  }

  onClassStatsCourseChange(): void {
    const term = this.classStatsCourse.trim().toLowerCase();
    this.filteredClassStatsCourses =
      term.length > 0
        ? this.allCourseNames.filter((c) => c.toLowerCase().includes(term))
        : [];
  }

  selectClassStatsCourse(name: string): void {
    this.classStatsCourse = name;
    this.filteredClassStatsCourses = [];
  }

  searchClassStats(): void {
    if (!this.selectedClassStatsClass) return;
    this.classLoading = true;
    this.classError = null;
    this.classStats = null;
    this.classLabel = this.selectedClassStatsClass.name;

    const courseName = this.classStatsCourse.trim();

    this.apollo
      .query<{ classStats: GradeStats }>({
        query: CLASS_STATS_QUERY,
        variables: {
          input: {
            classId: this.selectedClassStatsClass.id,
            ...(courseName ? { courseName } : {}),
          },
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

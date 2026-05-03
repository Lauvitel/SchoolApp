import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { FormsModule } from '@angular/forms';
import { MY_GRADES_QUERY } from '../../../core/graphql/grades.graphql';
import { Grade } from '../../../core/models/grade.model';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-my-grades',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-grades.component.html',
  styleUrl: './my-grades.component.scss',
})
export class MyGradesComponent implements OnInit {
  grades: Grade[] = [];
  loading = true;
  errorMessage: string | null = null;
  filterCourseName = '';

  allCourseNames: string[] = [];
  suggestions: string[] = [];
  showSuggestions = false;
  activeSuggestionIndex = -1;

  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  private gradesQuery!: QueryRef<{ myGrades: Grade[] }>;

  constructor(
    private apollo: Apollo,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.gradesQuery = this.apollo.watchQuery<{ myGrades: Grade[] }>({
      query: MY_GRADES_QUERY,
    });

    this.gradesQuery.valueChanges.subscribe({
      next: ({ data, loading }) => {
        this.loading = loading;
        this.grades = (data?.myGrades as Grade[]) ?? [];

        if (this.allCourseNames.length === 0 && this.grades.length > 0) {
          this.allCourseNames = [
            ...new Set(this.grades.map((g) => g.courseName)),
          ].sort();
        }
      },
      error: (err: unknown) => {
        this.loading = false;
        this.errorMessage = getErrorMessage(
          err,
          'Erreur lors du chargement des notes',
        );
      },
    });
  }

  onFilterInput(): void {
    const query = this.filterCourseName.trim().toLowerCase();
    if (!query) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.suggestions = this.allCourseNames.filter((name) =>
      name.toLowerCase().includes(query),
    );
    this.showSuggestions = this.suggestions.length > 0;
    this.activeSuggestionIndex = -1;
  }

  selectSuggestion(name: string): void {
    this.filterCourseName = name;
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.applyFilter();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = Math.min(
        this.activeSuggestionIndex + 1,
        this.suggestions.length - 1,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex = Math.max(this.activeSuggestionIndex - 1, 0);
    } else if (event.key === 'Enter' && this.activeSuggestionIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  applyFilter(): void {
    this.showSuggestions = false;
    const raw = this.filterCourseName.trim();
    if (!raw) {
      void this.gradesQuery.refetch({ filter: undefined });
      return;
    }

    const courses = raw
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const filter =
      courses.length === 1
        ? { courseName: courses[0] }
        : { courseNames: courses };

    void this.gradesQuery.refetch({ filter });
  }

  clearFilter(): void {
    this.filterCourseName = '';
    this.showSuggestions = false;
    void this.gradesQuery.refetch({ filter: undefined });
  }
}

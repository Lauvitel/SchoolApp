import { Component, OnInit } from '@angular/core';
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

  private gradesQuery!: QueryRef<{ myGrades: Grade[] }>;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.gradesQuery = this.apollo.watchQuery<{ myGrades: Grade[] }>({
      query: MY_GRADES_QUERY,
    });

    this.gradesQuery.valueChanges.subscribe({
      next: ({ data, loading }) => {
        this.loading = loading;
        this.grades = (data?.myGrades as Grade[]) ?? [];
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

  applyFilter(): void {
    const raw = this.filterCourseName.trim();
    if (!raw) {
      void this.gradesQuery.refetch({ filter: undefined });
      return;
    }

    const courses = raw.split(',').map((c) => c.trim()).filter((c) => c.length > 0);
    const filter = courses.length === 1
      ? { courseName: courses[0] }
      : { courseNames: courses };

    void this.gradesQuery.refetch({ filter });
  }

  clearFilter(): void {
    this.filterCourseName = '';
    void this.gradesQuery.refetch({ filter: undefined });
  }
}

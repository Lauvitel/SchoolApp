import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { MY_GRADES_QUERY } from '../../../core/graphql/grades.graphql';
import { Grade } from '../../../core/models/grade.model';

@Component({
  selector: 'app-my-grades',
  standalone: true,
  templateUrl: './my-grades.component.html',
  styleUrl: './my-grades.component.scss',
})
export class MyGradesComponent implements OnInit {
  grades: Grade[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .watchQuery<{ myGrades: Grade[] }>({ query: MY_GRADES_QUERY })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = loading;
          this.grades = (data?.myGrades as Grade[]) ?? [];
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.message || 'Erreur lors du chargement des notes';
        },
      });
  }
}

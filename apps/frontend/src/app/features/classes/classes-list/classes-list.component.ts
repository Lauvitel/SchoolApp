import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { RouterLink } from '@angular/router';
import { CLASSES_QUERY } from '../../../core/graphql/classes.graphql';
import { SchoolClass } from '../../../core/models/class.model';
import { getErrorMessage } from '../../../core/utils/error.utils';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss',
})
export class ClassesListComponent implements OnInit {
  classes: SchoolClass[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .watchQuery<{ classes: SchoolClass[] }>({ query: CLASSES_QUERY })
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
}

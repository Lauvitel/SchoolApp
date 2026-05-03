import { Component, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
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
  sortByName: 'asc' | 'desc' | null = null;

  private classesQuery!: QueryRef<{ classes: SchoolClass[] }>;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.classesQuery = this.apollo.watchQuery<{ classes: SchoolClass[] }>({
      query: CLASSES_QUERY,
    });

    this.classesQuery.valueChanges.subscribe({
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

  toggleSort(): void {
    if (this.sortByName === null) {
      this.sortByName = 'asc';
    } else if (this.sortByName === 'asc') {
      this.sortByName = 'desc';
    } else {
      this.sortByName = null;
    }

    const filter = this.sortByName ? { sortByName: this.sortByName } : undefined;
    void this.classesQuery.refetch({ filter });
  }
}

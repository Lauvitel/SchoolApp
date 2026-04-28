import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CLASS_BY_ID_QUERY } from '../../../core/graphql/classes.graphql';
import { SchoolClass } from '../../../core/models/class.model';
@Component({
  selector: 'app-class-detail',
  standalone: true,
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss',
})
export class ClassDetailComponent implements OnInit {
  schoolClass: SchoolClass | null = null;
  loading = true;
  errorMessage: string | null = null;
  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.apollo
      .watchQuery<{ class: SchoolClass }>({
        query: CLASS_BY_ID_QUERY,
        variables: { id },
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
}

import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ME_QUERY } from '../../core/graphql/users.graphql';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  errorMessage: string | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo
      .watchQuery<{ me: User }>({ query: ME_QUERY })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.loading = loading;
          this.user = (data?.me as User) ?? null;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.message || 'Erreur lors du chargement du profil';
        },
      });
  }
}

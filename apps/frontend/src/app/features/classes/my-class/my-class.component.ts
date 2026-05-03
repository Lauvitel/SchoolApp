import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CLASSES_WITH_STUDENTS_QUERY } from '../../../core/graphql/classes.graphql';
import { AuthService } from '../../../core/auth/auth.service';

interface ClassWithStudents {
  id: string;
  name: string;
  students: { studentId: string }[];
}

@Component({
  selector: 'app-my-class',
  standalone: true,
  template: `
    @if (loading) {
      <div class="page-container"><p class="loading">Chargement...</p></div>
    }
    @if (errorMessage) {
      <div class="page-container">
        <div class="error-message">{{ errorMessage }}</div>
      </div>
    }
  `,
  styles: [
    `
      .page-container {
        max-width: 700px;
        margin: 40px auto;
        padding: 0 20px;
      }
      .loading {
        color: #64748b;
      }
      .error-message {
        background-color: #fef2f2;
        color: #dc2626;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class MyClassComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      void this.router.navigate(['/login']);
      return;
    }

    this.apollo
      .query<{ classes: ClassWithStudents[] }>({
        query: CLASSES_WITH_STUDENTS_QUERY,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          const classes = (data?.classes as ClassWithStudents[]) ?? [];
          const myClass = classes.find((c) =>
            c.students.some((s) => s.studentId === currentUser.id),
          );

          if (myClass) {
            void this.router.navigate(['/classes', myClass.id]);
          } else {
            this.loading = false;
            this.errorMessage = "Vous n'êtes inscrit(e) dans aucune classe.";
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Erreur lors de la recherche de votre classe.';
        },
      });
  }
}

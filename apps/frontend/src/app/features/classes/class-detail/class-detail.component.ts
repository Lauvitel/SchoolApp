import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { FormsModule } from '@angular/forms';
import {
  CLASS_BY_ID_QUERY,
  ADD_STUDENT_TO_CLASS_MUTATION,
} from '../../../core/graphql/classes.graphql';
import { USERS_QUERY } from '../../../core/graphql/users.graphql';
import { SchoolClass } from '../../../core/models/class.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss',
})
export class ClassDetailComponent implements OnInit {
  schoolClass: SchoolClass | null = null;
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  isProfessor = false;
  showAddStudent = false;
  addingStudent = false;

  searchTerm = '';
  allStudents: User[] = [];
  filteredStudents: User[] = [];
  selectedStudent: User | null = null;

  usersMap = new Map<string, User>();

  private classId!: string;

  constructor(
    private apollo: Apollo,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isProfessor = this.authService.getUserRole() === 'PROFESSOR';

    this.classId = this.route.snapshot.paramMap.get('id')!;

    this.apollo
      .query<{ users: User[] }>({
        query: USERS_QUERY,
        fetchPolicy: 'cache-first',
      })
      .subscribe({
        next: ({ data }) => {
          const users = (data?.users as User[]) ?? [];
          for (const u of users) {
            this.usersMap.set(u.id, u);
          }
          this.allStudents = users.filter((u) => u.role === 'STUDENT');
        },
      });

    this.apollo
      .watchQuery<{ class: SchoolClass }>({
        query: CLASS_BY_ID_QUERY,
        variables: { id: this.classId },
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

  getStudentName(studentId: string): string {
    const user = this.usersMap.get(studentId);
    return user ? user.pseudo : studentId;
  }

  getStudentEmail(studentId: string): string {
    const user = this.usersMap.get(studentId);
    return user?.email ?? '';
  }

  openAddStudent(): void {
    this.showAddStudent = true;
    this.searchTerm = '';
    this.selectedStudent = null;
    this.filteredStudents = [];
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelAddStudent(): void {
    this.showAddStudent = false;
    this.searchTerm = '';
    this.selectedStudent = null;
    this.filteredStudents = [];
  }

  onSearchChange(): void {
    this.selectedStudent = null;
    const term = this.searchTerm.trim().toLowerCase();
    if (term.length === 0) {
      this.filteredStudents = [];
      return;
    }

    const enrolledIds = new Set(
      this.schoolClass?.students?.map((s) => s.studentId) ?? [],
    );

    this.filteredStudents = this.allStudents
      .filter(
        (u) =>
          !enrolledIds.has(u.id) &&
          (u.pseudo.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)),
      )
      .slice(0, 10);
  }

  selectStudent(student: User): void {
    this.selectedStudent = student;
    this.searchTerm = `${student.pseudo} (${student.email})`;
    this.filteredStudents = [];
  }

  addStudent(): void {
    if (!this.selectedStudent || this.addingStudent) return;
    this.addingStudent = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.apollo
      .mutate<{ addStudentToClass: SchoolClass }>({
        mutation: ADD_STUDENT_TO_CLASS_MUTATION,
        variables: {
          input: { classId: this.classId, studentId: this.selectedStudent.id },
        },
        refetchQueries: [
          { query: CLASS_BY_ID_QUERY, variables: { id: this.classId } },
        ],
      })
      .subscribe({
        next: ({ data }) => {
          this.addingStudent = false;
          this.schoolClass =
            (data?.addStudentToClass as SchoolClass) ?? this.schoolClass;
          this.successMessage = `${this.selectedStudent!.pseudo} ajouté(e) avec succès`;
          this.cancelAddStudent();
        },
        error: (err) => {
          this.addingStudent = false;
          this.errorMessage = err?.message || "Erreur lors de l'ajout";
        },
      });
  }
}

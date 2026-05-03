import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  STUDENT_GRADES_QUERY,
  CREATE_GRADE_MUTATION,
  UPDATE_GRADE_MUTATION,
  DELETE_GRADE_MUTATION,
  COURSE_NAMES_QUERY,
} from '../../../core/graphql/grades.graphql';
import { USERS_QUERY } from '../../../core/graphql/users.graphql';
import { CLASSES_WITH_STUDENTS_QUERY } from '../../../core/graphql/classes.graphql';
import { Grade } from '../../../core/models/grade.model';
import { User } from '../../../core/models/user.model';

interface ClassWithStudents {
  id: string;
  name: string;
  students: { studentId: string }[];
}

@Component({
  selector: 'app-professor-grades',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './professor-grades.component.html',
  styleUrl: './professor-grades.component.scss',
})
export class ProfessorGradesComponent implements OnInit {
  grades: Grade[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  gradeForm!: FormGroup;
  editingGradeId: string | null = null;
  saving = false;
  deleteConfirmId: string | null = null;
  deleting = false;

  searchTerm = '';
  allStudents: User[] = [];
  filteredStudents: User[] = [];
  selectedStudent: User | null = null;

  createSearchTerm = '';
  createFilteredStudents: User[] = [];
  selectedCreateStudent: User | null = null;

  allCourseNames: string[] = [];
  filteredCourseNames: string[] = [];

  private studentClassMap = new Map<string, string>();

  constructor(
    private apollo: Apollo,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.gradeForm = this.fb.group({
      courseName: ['', [Validators.required]],
      value: [
        null,
        [Validators.required, Validators.min(0), Validators.max(20)],
      ],
    });

    this.loadStudentsAndClasses();

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

    this.gradeForm
      .get('courseName')
      ?.valueChanges.subscribe((value: string) => {
        this.onCourseNameChange(value);
      });
  }

  private loadStudentsAndClasses(): void {
    this.apollo
      .query<{
        users: User[];
      }>({ query: USERS_QUERY, fetchPolicy: 'network-only' })
      .subscribe({
        next: ({ data }) => {
          this.allStudents = ((data?.users as User[]) ?? []).filter(
            (u) => u.role === 'STUDENT',
          );
        },
      });

    this.apollo
      .query<{ classes: ClassWithStudents[] }>({
        query: CLASSES_WITH_STUDENTS_QUERY,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.studentClassMap.clear();
          for (const cls of (data?.classes as ClassWithStudents[]) ?? []) {
            for (const s of cls.students) {
              this.studentClassMap.set(s.studentId, cls.id);
            }
          }
        },
      });
  }

  onCourseNameChange(term: string): void {
    if (!term || typeof term !== 'string' || term.trim().length === 0) {
      this.filteredCourseNames = [];
      return;
    }
    const lowerTerm = term.trim().toLowerCase();
    this.filteredCourseNames = this.allCourseNames.filter(
      (c) =>
        c.toLowerCase().includes(lowerTerm) && c.toLowerCase() !== lowerTerm,
    );
  }

  selectCourseName(courseName: string): void {
    this.gradeForm.patchValue({ courseName });
    this.filteredCourseNames = [];
  }

  onSearchChange(): void {
    this.selectedStudent = null;
    const term = this.searchTerm.trim().toLowerCase();
    if (term.length === 0) {
      this.filteredStudents = [];
      return;
    }
    this.filteredStudents = this.allStudents
      .filter(
        (u) =>
          u.pseudo.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      )
      .slice(0, 10);
  }

  selectStudent(student: User): void {
    this.selectedStudent = student;
    this.searchTerm = `${student.pseudo} (${student.email})`;
    this.filteredStudents = [];
    this.loadGrades(student.id);
  }

  clearSearch(): void {
    this.selectedStudent = null;
    this.searchTerm = '';
    this.filteredStudents = [];
    this.grades = [];
  }

  private loadGrades(studentId: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.apollo
      .query<{ studentGrades: Grade[] }>({
        query: STUDENT_GRADES_QUERY,
        variables: { filter: { studentId } },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.loading = false;
          this.grades = (data?.studentGrades as Grade[]) ?? [];
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.message || 'Erreur lors de la recherche';
        },
      });
  }

  onCreateSearchChange(): void {
    this.selectedCreateStudent = null;
    const term = this.createSearchTerm.trim().toLowerCase();
    if (term.length === 0) {
      this.createFilteredStudents = [];
      return;
    }
    this.createFilteredStudents = this.allStudents
      .filter(
        (u) =>
          u.pseudo.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      )
      .slice(0, 10);
  }

  selectCreateStudent(student: User): void {
    this.selectedCreateStudent = student;
    this.createSearchTerm = `${student.pseudo} (${student.email})`;
    this.createFilteredStudents = [];
  }

  clearCreateStudent(): void {
    this.selectedCreateStudent = null;
    this.createSearchTerm = '';
    this.createFilteredStudents = [];
  }

  startEdit(grade: Grade): void {
    this.editingGradeId = grade.id;
    this.gradeForm.patchValue({
      courseName: grade.courseName,
      value: grade.value,
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.editingGradeId = null;
    this.gradeForm.reset({ courseName: '', value: null });
  }

  saveGrade(): void {
    if (this.gradeForm.invalid || this.saving) return;
    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { courseName, value } = this.gradeForm.value as {
      courseName: string;
      value: number;
    };

    if (this.editingGradeId) {
      this.apollo
        .mutate({
          mutation: UPDATE_GRADE_MUTATION,
          variables: {
            id: this.editingGradeId,
            input: { courseName, value },
          },
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.editingGradeId = null;
            this.successMessage = 'Note modifiée avec succès';
            if (this.selectedStudent) this.loadGrades(this.selectedStudent.id);
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage =
              err?.message || 'Erreur lors de la modification';
          },
        });
    } else {
      const studentId = this.selectedCreateStudent?.id;
      if (!studentId) {
        this.saving = false;
        this.errorMessage = 'Veuillez sélectionner un élève';
        return;
      }

      const classId = this.studentClassMap.get(studentId) ?? null;

      this.apollo
        .mutate({
          mutation: CREATE_GRADE_MUTATION,
          variables: {
            input: {
              studentId,
              courseName,
              value,
              ...(classId ? { classId } : {}),
            },
          },
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.gradeForm.patchValue({ courseName: '', value: null });
            this.successMessage = `Note créée pour ${this.selectedCreateStudent!.pseudo}`;
            if (this.selectedStudent?.id === studentId) {
              this.loadGrades(studentId);
            }
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage = err?.message || 'Erreur lors de la création';
          },
        });
    }
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteGrade(id: string): void {
    this.deleting = true;
    this.errorMessage = null;

    this.apollo
      .mutate({
        mutation: DELETE_GRADE_MUTATION,
        variables: { id },
      })
      .subscribe({
        next: () => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.successMessage = 'Note supprimée avec succès';
          if (this.selectedStudent) this.loadGrades(this.selectedStudent.id);
        },
        error: (err) => {
          this.deleting = false;
          this.deleteConfirmId = null;
          this.errorMessage = err?.message || 'Erreur lors de la suppression';
        },
      });
  }
}

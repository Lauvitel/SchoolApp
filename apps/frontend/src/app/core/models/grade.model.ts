export interface Grade {
  id: string;
  studentId: string;
  professorId: string;
  classId?: string | null;
  courseName: string;
  value: number;
}

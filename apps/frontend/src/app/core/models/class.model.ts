export interface ClassStudent {
  id: string;
  studentId: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  studentCount: number;
  students?: ClassStudent[];
}

import { gql } from 'apollo-angular';

export const MY_GRADES_QUERY = gql`
  query MyGrades($filter: MyGradesFilterInput) {
    myGrades(filter: $filter) {
      id
      studentId
      professorId
      classId
      courseName
      value
    }
  }
`;

export const STUDENT_GRADES_QUERY = gql`
  query StudentGrades($filter: StudentGradesFilterInput!) {
    studentGrades(filter: $filter) {
      id
      studentId
      professorId
      classId
      courseName
      value
    }
  }
`;

export const CREATE_GRADE_MUTATION = gql`
  mutation CreateGrade($input: CreateGradeInput!) {
    createGrade(input: $input) {
      id
      studentId
      professorId
      classId
      courseName
      value
    }
  }
`;

export const UPDATE_GRADE_MUTATION = gql`
  mutation UpdateGrade($id: ID!, $input: UpdateGradeInput!) {
    updateGrade(id: $id, input: $input) {
      id
      studentId
      professorId
      classId
      courseName
      value
    }
  }
`;

export const DELETE_GRADE_MUTATION = gql`
  mutation DeleteGrade($id: ID!) {
    deleteGrade(id: $id) {
      id
    }
  }
`;

export const COURSE_STATS_QUERY = gql`
  query CourseStats($input: CourseStatsInput!) {
    courseStats(input: $input) {
      count
      average
      median
      min
      max
    }
  }
`;

export const CLASS_STATS_QUERY = gql`
  query ClassStats($input: ClassStatsInput!) {
    classStats(input: $input) {
      count
      average
      median
      min
      max
    }
  }
`;

export const COURSE_NAMES_QUERY = gql`
  query CourseNames {
    courseNames
  }
`;


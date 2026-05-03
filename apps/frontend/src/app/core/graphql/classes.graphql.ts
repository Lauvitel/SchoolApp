import { gql } from 'apollo-angular';

export const CLASSES_QUERY = gql`
  query Classes($filter: ClassesFilterInput) {
    classes(filter: $filter) {
      id
      name
      studentCount
    }
  }
`;

export const CLASS_BY_ID_QUERY = gql`
  query ClassById($id: ID!) {
    class(id: $id) {
      id
      name
      studentCount
      students {
        id
        studentId
      }
    }
  }
`;

export const CREATE_CLASS_MUTATION = gql`
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
      name
      studentCount
    }
  }
`;

export const UPDATE_CLASS_MUTATION = gql`
  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      id
      name
      studentCount
    }
  }
`;

export const DELETE_CLASS_MUTATION = gql`
  mutation DeleteClass($id: ID!) {
    deleteClass(id: $id) {
      id
    }
  }
`;

export const ADD_STUDENT_TO_CLASS_MUTATION = gql`
  mutation AddStudentToClass($input: AddStudentToClassInput!) {
    addStudentToClass(input: $input) {
      id
      name
      studentCount
      students {
        id
        studentId
      }
    }
  }
`;

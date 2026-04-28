import { gql } from 'apollo-angular';

export const CLASSES_QUERY = gql`
  query Classes {
    classes {
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

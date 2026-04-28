import { gql } from 'apollo-angular';

export const MY_GRADES_QUERY = gql`
  query MyGrades {
    myGrades {
      id
      studentId
      professorId
      classId
      courseName
      value
    }
  }
`;

import { gql } from 'apollo-angular';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      pseudo
      role
    }
  }
`;

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      email
      pseudo
      role
    }
  }
`;

export const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
      id
      email
      pseudo
      role
    }
  }
`;

export const DELETE_ME_MUTATION = gql`
  mutation DeleteMe {
    deleteMe {
      id
    }
  }
`;

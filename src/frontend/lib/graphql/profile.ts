import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      displayName
      avatarUrl
      bio
      createdAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      displayName
      avatarUrl
      bio
      createdAt
    }
  }
`;

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface GetMeData {
  me: User | null;
}

export interface UpdateProfileInput {
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

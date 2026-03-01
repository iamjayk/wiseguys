import { gql } from "@apollo/client";

export const GET_TITLES = gql`
  query GetTitles($type: String) {
    titles(type: $type) {
      id
      type
      name
      year
      yearEnd
      description
      posterUrl
      cast
    }
  }
`;

export const GET_TITLE = gql`
  query GetTitle($id: Int!) {
    title(id: $id) {
      id
      type
      name
      year
      yearEnd
      description
      posterUrl
      cast
    }
  }
`;

export interface Title {
  id: number;
  type: string;
  name: string;
  year: number;
  yearEnd: number | null;
  description: string | null;
  posterUrl: string | null;
  cast: string[];
}

export interface GetTitlesData {
  titles: Title[];
}

export interface GetTitleData {
  title: Title | null;
}

export const CREATE_TITLE = gql`
  mutation CreateTitle($input: CreateTitleInput!) {
    createTitle(input: $input) {
      id
      type
      name
      year
      yearEnd
      description
      posterUrl
      cast
    }
  }
`;

export const UPDATE_TITLE = gql`
  mutation UpdateTitle($id: Int!, $input: UpdateTitleInput!) {
    updateTitle(id: $id, input: $input) {
      id
      type
      name
      year
      yearEnd
      description
      posterUrl
      cast
    }
  }
`;

export const DELETE_TITLE = gql`
  mutation DeleteTitle($id: Int!) {
    deleteTitle(id: $id)
  }
`;

export interface CreateTitleInput {
  type: string;
  name: string;
  year: number;
  yearEnd?: number | null;
  description?: string | null;
  posterUrl?: string | null;
  cast?: string[] | null;
}

export interface UpdateTitleInput {
  type?: string | null;
  name?: string | null;
  year?: number | null;
  yearEnd?: number | null;
  description?: string | null;
  posterUrl?: string | null;
  cast?: string[] | null;
}

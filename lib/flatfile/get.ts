import { gql } from "graphql-request";
import { ACTIVE_FLATFILE_ENV, FLATFILE_TEAM } from "../../constants";
import { createFlatfileGraphQLClient } from "../graphqlClient";

const getEmbedsQuery = gql`
  query(
    $searchQuery: String
  ) {
    getEmbeds(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${ACTIVE_FLATFILE_ENV}"
      archived: false,
      search: $searchQuery
    ) {
      pagination {
        nextOffset
        offset
        onPage
        previousOffset
      }
      data {
          id
          name
          schemas {
            id
            name
          }
      }
    }
  }
`;

const getTemplatesQuery = gql`
  query(
    $searchQuery: String
  ) {
    getSchemas(
      teamId: ${FLATFILE_TEAM}
      environmentId: "${ACTIVE_FLATFILE_ENV}"
      archived: false,
      search: $searchQuery
    ) {
      pagination {
        nextOffset
        offset
        onPage
        previousOffset
      }
      data {
          id
          name
      }
    }
  }
`;

const getFinalDatabaseViewQuery = gql`
  query ($batchId: UUID!) {
    getFinalDatabaseView(batchId: $batchId, limit: 1000000) {
      rows
    }
  }
`;

export const getEmbeds = async (token: string, searchQuery = "") => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{
    getEmbeds: {
      data: {
        name: string;
        id: string;
        schemas: { id: string; name: string }[];
      }[];
    };
  }>(getEmbedsQuery, {
    searchQuery,
  });
  return data.getEmbeds.data;
};

export const getTemplates = async (token: string, searchQuery = "") => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<{
    getSchemas: { data: { name: string; id: string }[] };
  }>(getTemplatesQuery, {
    searchQuery,
  });
  return data.getSchemas.data;
};

export const getFinalDatabaseView = async (token: string, batchId: string) => {
  const graphQLClient = createFlatfileGraphQLClient(token);
  return await graphQLClient.request<{
    getFinalDatabaseView: {
      rows: {
        id: number;
        status: string;
        valid: boolean;
        data: {
          data_source_id: number | null;
          external_id: number | null;
          name: string;
          slug: string;
          name_sort: null;
          alias: string;
          abbreviation: string;
          gender: string;
          place_of_birth: string;
          date_of_birth: string;
          bio_short: string;
          bio_medium: string;
          bio_long: string;
        };
        info: [];
      }[];
    };
  }>(getFinalDatabaseViewQuery, {
    batchId,
  });
};

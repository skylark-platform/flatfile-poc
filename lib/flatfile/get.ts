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

const getOriginalDataQuery = gql`
  query ($batchId: UUID!) {
    getOriginalData(batchId: $batchId) {
      dataHeaders
      dataRows
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

export const getOriginalData = async (token: string, batchId: string) => {
  console.log("heeere");
  const graphQLClient = createFlatfileGraphQLClient(token);
  const data = await graphQLClient.request<any>(getOriginalDataQuery, {
    batchId,
  });
  console.log("data ####", data);
  return data;
};

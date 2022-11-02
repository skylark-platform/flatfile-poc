import { GraphQLClient } from "graphql-request";
import { FLATFILE_GRAPHQL_URL, SAAS_ACCOUNT_ID, SAAS_API_ENDPOINT, SAAS_API_KEY } from "../constants";

export const skylarkGraphQLClient = new GraphQLClient(SAAS_API_ENDPOINT, {
  headers: {
    "x-api-key": SAAS_API_KEY,
    "x-account-id": SAAS_ACCOUNT_ID,
  },
});

export const createFlatfileGraphQLClient = (token: string) => new GraphQLClient(FLATFILE_GRAPHQL_URL, {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

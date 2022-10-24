import { request, GraphQLClient } from "graphql-request";
import {
  SAAS_ACCOUNT_ID,
  SAAS_API_ENDPOINT,
  SAAS_API_KEY,
} from "../skylark/skylark.constants";

const HARDCODED_OBJECT = "EpisodeInput";

const query = `
{
  __schema {
    mutationType {
      name
      inputFields {
        description
        defaultValue
      }
      fields {
        name
        args {
          name
          defaultValue
          type {
            name
            description
          }
        }
      }
    }
  }
  }
  `;

export const graphQLClient = new GraphQLClient(SAAS_API_ENDPOINT, {
  headers: {
    "x-api-key": SAAS_API_KEY,
    "x-account-id": SAAS_ACCOUNT_ID,
  },
});

const parseInputsFromMutations = () => {};

const listCreateMutations = (fields: any) => {
  console.log("mutations without filter", fields);
  return fields?.filter((field) => field?.name.includes("create"));
};

// RENAME TO GET_FIELDS_FROM_INPUT
export const getMutations = () => {
  // const client = new GraphQLClient(endpoint, { headers: {} });
  const data = graphQLClient
    .request(query, {})
    .then((data) =>
      console.log(listCreateMutations(data.__schema?.mutationType?.fields))
    );

  console.log("final data", data);
  return data;
};

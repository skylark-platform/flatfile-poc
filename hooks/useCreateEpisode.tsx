import { request, GraphQLClient } from "graphql-request";
import {
  SAAS_ACCOUNT_ID,
  SAAS_API_ENDPOINT,
  SAAS_API_KEY,
} from "../skylark/skylark.constants";

const HARDCODED_OBJECT = "Episode";

const query = `
{
  __schema {
    mutationType  {
      name
      inputFields {
        description
        defaultValue
      }
      fields {
        name 
        args  {
          name
          defaultValue
          type {
            ...TypeRef
          }
        }
      }
    }
  }
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
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

const getFields = (fields: any) => {
  console.log("fields without filter", fields);
  return fields?.filter((field) => field?.type?.name != null);
};

export const useCreateEpisode = () => {
  // const client = new GraphQLClient(endpoint, { headers: {} });
  const data = graphQLClient
    .request(query, {})
    .then((data) => console.log(getFields(data.__type?.fields)));

  console.log("final data", data);
  return data;
};

/*
{
    __schema {
      types {
        name
        kind
        possibleTypes {
          name
        }
      }
    }
  }
*/

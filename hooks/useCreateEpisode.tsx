import { graphQLClient } from "../skylark/graphqlClient";

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

import { graphQLClient } from "../skylark/graphqlClient";

const HARDCODED_OBJECT = "EpisodeInput";

const query = `
{
    __type(name: "${HARDCODED_OBJECT}") {
      name
      kind
      inputFields {
        name
        type {
          name
          kind
          description
          enumValues{
            name
          }
          ofType {
            name
            kind
          }
        }
      }
    }
  }
  `;

const getEnumTypes = () => {
  console.log("enum types");
};

/**
 *
 * @param fields
 * @returns
 *
 * this creates a list of fields from input
 */
const getFields = (fields: any) => {
  console.log("fields without filter", fields);
  return fields?.filter((field) => field?.type?.name != null);
};

// RENAME TO GET_FIELDS_FROM_INPUT
export const useEpisode = () => {
  // const client = new GraphQLClient(endpoint, { headers: {} });
  const data = graphQLClient
    .request(query, {})
    .then((data) => console.log(getFields(data.__type?.inputFields)));

  console.log("final data", data);
  return data;
};

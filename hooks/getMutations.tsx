import { graphQLClient } from "../skylark/graphqlClient";

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

const parseInputsFromMutations = (unparsedList) => {
  unparsedList.map((item) => {
    console.log(item?.args?.[0].name);
    console.log(item?.args?.[0].type.name);
  });
};

const listCreateMutations = (fields: any) => {
  console.log("mutations without filter", fields);
  parseInputsFromMutations(
    fields?.filter((field) => field?.name.includes("create"))
  );
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
